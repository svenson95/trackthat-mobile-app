/* eslint-disable no-console */
import chalk from 'chalk';

import type { Reporter, TestCase, TestModule, TestSuite } from 'vitest/node';

type TestGroup = {
  name: string;
  path?: string;
  matches?: (path: string) => boolean;
  sectionByFolder?: boolean;
  sectionRoot?: string;
  sectionOrder?: string[];
};

type FeatureSection = {
  path: string;
  name: string;
  fileSuffixes?: string[];
};

const FEATURE_SECTIONS: FeatureSection[] = [
  {
    path: 'components',
    name: 'COMPONENTS',
    fileSuffixes: ['.component.spec.ts'],
  },
  {
    path: 'dialogs',
    name: 'DIALOGS',
    fileSuffixes: ['.dialog.spec.ts'],
  },
  {
    path: 'services',
    name: 'SERVICES',
    fileSuffixes: ['.service.spec.ts'],
  },
];

const TEST_GROUPS: TestGroup[] = [
  {
    name: 'GLOBAL',
    matches: (path) =>
      path.includes('/app.component.spec.') ||
      path.includes('/app.config.spec.') ||
      path.includes('/app.routes.spec.'),
  },
  {
    name: 'CORE',
    path: '/core/',
    sectionByFolder: true,
  },
  {
    name: 'SHARED',
    path: '/shared/',
    sectionByFolder: true,
  },
  {
    name: 'TRAINING',
    path: '/features/training/',
    sectionByFolder: true,
    sectionRoot: 'subfeatures',
    sectionOrder: ['data-access', 'workouts', 'workout', 'log-workout'],
  },
  {
    name: 'EAT',
    path: '/features/eat/',
  },
  {
    name: 'OVERVIEW',
    path: '/features/overview/',
  },
  {
    name: 'LOGS',
    path: '/features/logs/',
  },
  {
    name: 'MORE',
    path: '/features/more/',
  },
];

class GroupedReporter implements Reporter {
  onTestRunEnd(testModules: ReadonlyArray<TestModule>): void {
    const groupedModules = this.groupBy(
      testModules,
      (module) => this.getGroup(module.moduleId).name,
    );

    for (const group of TEST_GROUPS) {
      const modules = groupedModules.get(group.name);

      if (!modules?.length) {
        continue;
      }

      this.printGroup(group.name, modules);
    }

    const otherModules = groupedModules.get('OTHER');

    if (otherModules?.length) {
      this.printGroup('OTHER', otherModules);
    }

    this.printSummary(testModules);
  }

  private printGroup(name: string, modules: readonly TestModule[]): void {
    console.log();
    console.log(chalk.bold.cyan(name));

    const groupedSections = this.groupBy(
      modules,
      (module) => this.getSectionName(module.moduleId, name) ?? 'ROOT',
    );

    const rootModules = groupedSections.get('ROOT');

    if (rootModules?.length) {
      this.printSortedModules(name, rootModules, 1);
    }

    const group = TEST_GROUPS.find((group) => group.name === name);

    const sections = [...groupedSections.entries()]
      .filter(([sectionName]) => sectionName !== 'ROOT')
      .sort(([sectionA], [sectionB]) =>
        this.compareSections(sectionA, sectionB, group?.sectionOrder),
      );

    for (const [sectionName, sectionModules] of sections) {
      console.log();
      console.log(`${this.indent(1)}${chalk.bold.cyan(sectionName)}`);

      this.printSortedModules(name, sectionModules, 2);
    }
  }

  private compareSections(
    sectionA: string,
    sectionB: string,
    sectionOrder?: readonly string[],
  ): number {
    if (!sectionOrder) {
      return sectionA.localeCompare(sectionB);
    }

    const normalizedSectionA = sectionA.toLowerCase();
    const normalizedSectionB = sectionB.toLowerCase();

    const indexA = sectionOrder.indexOf(normalizedSectionA);
    const indexB = sectionOrder.indexOf(normalizedSectionB);

    if (indexA === -1 && indexB === -1) {
      return sectionA.localeCompare(sectionB);
    }

    if (indexA === -1) {
      return 1;
    }

    if (indexB === -1) {
      return -1;
    }

    return indexA - indexB;
  }

  private printSortedModules(
    groupName: string,
    modules: readonly TestModule[],
    depth: number,
  ): void {
    const sortedModules = [...modules].sort((a, b) => {
      const depthDifference =
        this.getPathDepth(a.moduleId, groupName) - this.getPathDepth(b.moduleId, groupName);

      if (depthDifference !== 0) {
        return depthDifference;
      }

      return a.moduleId.localeCompare(b.moduleId);
    });

    for (const module of sortedModules) {
      this.printModule(module, depth);
    }
  }

  private printModule(module: TestModule, depth: number): void {
    const children = [...module.children];

    for (const child of children) {
      if (child.type === 'suite') {
        this.printSuite(child, depth);
      } else {
        console.log(`${this.indent(depth)}${chalk.white(this.getFileName(module.moduleId))}`);

        this.printTest(child, depth + 1);
      }
    }

    for (const error of module.errors()) {
      console.log();
      console.log(`${this.indent(depth)}${chalk.bold.red('Failure:')}`);
      console.log(`${this.indent(depth + 1)}${chalk.red(error.message)}`);
    }
  }

  private printSuite(suite: TestSuite, depth: number): void {
    const passed = suite.ok();
    const symbol = passed ? chalk.green('✓') : chalk.red('✕');
    const name = passed ? chalk.white(suite.name) : chalk.red(suite.name);

    console.log(`${this.indent(depth)}${symbol} ${name}`);

    for (const child of suite.children) {
      if (child.type === 'suite') {
        this.printSuite(child, depth + 1);
      } else {
        this.printTest(child, depth + 1);
      }
    }
  }

  private printTest(test: TestCase, depth: number): void {
    const result = test.result();
    const duration = test.diagnostic()?.duration;

    console.log(
      `${this.indent(depth)}` +
        `${this.getTestSymbol(result.state)} ` +
        `${this.getTestName(test, result.state)}` +
        `${this.getDuration(duration)}`,
    );
  }

  private printSummary(modules: readonly TestModule[]): void {
    const tests = modules.flatMap((module) => [...module.children.allTests()]);

    const passedTests = tests.filter((test) => test.result().state === 'passed').length;

    const failedTests = tests.filter((test) => test.result().state === 'failed').length;

    const skippedTests = tests.filter((test) => test.result().state === 'skipped').length;

    const passedModules = modules.filter((module) => module.ok()).length;
    const failedModules = modules.length - passedModules;

    const moduleResults = [
      failedModules > 0 && chalk.red(`${failedModules} failed`),
      passedModules > 0 && chalk.green(`${passedModules} passed`),
    ].filter(Boolean);

    const testResults = [
      failedTests > 0 && chalk.red(`${failedTests} failed`),
      passedTests > 0 && chalk.green(`${passedTests} passed`),
      skippedTests > 0 && chalk.yellow(`${skippedTests} skipped`),
    ].filter(Boolean);

    console.log();
    console.log(chalk.gray('─'.repeat(48)));
    console.log();

    console.log(
      `${chalk.bold('Test Files:')} ${moduleResults.join(', ')}, ${modules.length} total`,
    );

    console.log(`${chalk.bold('Tests:')}      ${testResults.join(', ')}, ${tests.length} total`);
  }

  private getSectionName(path: string, groupName: string): string | null {
    const group = TEST_GROUPS.find((group) => group.name === groupName);

    if (!group?.path) {
      return null;
    }

    const relativePath = path.split(group.path)[1];

    if (!relativePath) {
      return null;
    }

    const pathParts = relativePath.split('/').filter(Boolean);
    const [rootFolder] = pathParts;

    if (group.sectionByFolder) {
      const sectionFolder = group.sectionRoot === rootFolder ? pathParts[1] : rootFolder;

      return sectionFolder ? this.formatSectionName(sectionFolder) : null;
    }

    const folderSection = FEATURE_SECTIONS.find((section) => section.path === rootFolder);

    if (folderSection) {
      return folderSection.name;
    }

    return (
      FEATURE_SECTIONS.find((section) =>
        section.fileSuffixes?.some((suffix) => relativePath.endsWith(suffix)),
      )?.name ?? null
    );
  }

  private formatSectionName(folderName: string): string {
    return folderName.toUpperCase();
  }

  private getGroup(path: string): TestGroup {
    return (
      TEST_GROUPS.find((group) =>
        group.matches ? group.matches(path) : path.includes(group.path ?? ''),
      ) ?? { name: 'OTHER' }
    );
  }

  private getPathDepth(path: string, groupName: string): number {
    const group = TEST_GROUPS.find((group) => group.name === groupName);

    if (!group?.path) {
      return 0;
    }

    const relativePath = path.split(group.path)[1];

    return relativePath?.split('/').length ?? Number.MAX_SAFE_INTEGER;
  }

  private getTestSymbol(state: string): string {
    switch (state) {
      case 'passed':
        return chalk.green('✓');

      case 'failed':
        return chalk.red('✕');

      case 'skipped':
        return chalk.yellow('○');

      case 'pending':
        return chalk.gray('?');

      default:
        return chalk.gray('?');
    }
  }

  private getTestName(test: TestCase, state: string): string {
    return state === 'failed' ? chalk.red(test.name) : chalk.white(test.name);
  }

  private getDuration(duration?: number): string {
    if (duration == null) {
      return '';
    }

    return chalk.gray(` (${Math.round(duration)} ms)`);
  }

  private getFileName(path: string): string {
    return path.split('/').at(-1)?.replace('.spec.ts', '') ?? path;
  }

  private indent(depth: number): string {
    return '  '.repeat(depth);
  }

  private groupBy<T>(items: readonly T[], getKey: (item: T) => string): Map<string, T[]> {
    const groups = new Map<string, T[]>();

    for (const item of items) {
      const key = getKey(item);
      const group = groups.get(key);

      if (group) {
        group.push(item);
      } else {
        groups.set(key, [item]);
      }
    }

    return groups;
  }
}

export default GroupedReporter;
