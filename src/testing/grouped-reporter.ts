/* eslint-disable no-console */
import chalk from 'chalk';

import type { Reporter, TestCase, TestModule, TestSuite } from 'vitest/node';

const FEATURE_SECTIONS = [
  {
    path: 'components',
    name: 'COMPONENTS',
  },
  {
    path: 'pages',
    name: 'PAGES',
  },
  {
    path: 'services',
    name: 'SERVICES',
  },
  {
    path: 'models',
    name: 'MODELS',
  },
];

const TEST_GROUPS = [
  {
    name: 'GLOBAL',
    matches: (path: string): boolean =>
      path.includes('/app.component.spec.') ||
      path.includes('/app.config.spec.') ||
      path.includes('/app.routes.spec.'),
  },
  {
    name: 'CORE',
    path: '/core/',
  },
  {
    name: 'SHARED',
    path: '/shared/',
  },
  {
    name: 'TRAINING',
    path: '/features/training/',
  },
  {
    name: 'LOGS',
    path: '/features/logs/',
  },
  {
    name: 'OVERVIEW',
    path: '/features/overview/',
  },
  {
    name: 'EAT',
    path: '/features/eat/',
  },
  {
    name: 'MORE',
    path: '/features/more/',
  },
];

type TestGroup = {
  name: string;
  path?: string;
  matches?: (path: string) => boolean;
};

type FeatureSection = {
  path: string;
  name: string;
};

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
    console.log(`\n${chalk.bold.cyan(name)}\n`);

    const sectionResults = this.groupBy(
      modules,
      (module) => this.getFeatureSection(module.moduleId, name)?.name ?? 'ROOT',
    );

    const rootModules = sectionResults.get('ROOT') ?? [];

    this.printSortedModules(name, rootModules);

    for (const section of FEATURE_SECTIONS) {
      const sectionModules = sectionResults.get(section.name);

      if (!sectionModules?.length) {
        continue;
      }

      console.log(`  ${chalk.bold.cyan(section.name)}\n`);

      this.printSortedModules(name, sectionModules, 1);
    }
  }

  private printSortedModules(groupName: string, modules: readonly TestModule[], indent = 0): void {
    const sortedModules = [...modules].sort((a, b) => {
      const depthDifference =
        this.getPathDepth(a.moduleId, groupName) - this.getPathDepth(b.moduleId, groupName);

      if (depthDifference !== 0) {
        return depthDifference;
      }

      return a.moduleId.localeCompare(b.moduleId);
    });

    for (const module of sortedModules) {
      this.printModule(module, indent);
    }
  }

  private printModule(module: TestModule, baseDepth: number): void {
    const baseIndent = '  '.repeat(baseDepth);

    for (const child of module.children) {
      if (child.type === 'suite') {
        this.printSuite(child, baseDepth + 1);
      } else {
        console.log(`${baseIndent}  ${chalk.white(this.getFileName(module.moduleId))}`);
        this.printTest(child, baseDepth + 2);
      }
    }

    for (const error of module.errors()) {
      console.log(chalk.red('\n  Failure:'));
      console.log(error.message);
    }

    console.log();
  }

  private printSuite(suite: TestSuite, depth: number): void {
    const indent = '  '.repeat(depth);
    const passed = suite.ok();

    console.log(
      `${indent}${passed ? chalk.green('✓') : chalk.red('✕')} ${
        passed ? chalk.white(suite.name) : chalk.red(suite.name)
      }`,
    );

    for (const child of suite.children) {
      if (child.type === 'suite') {
        this.printSuite(child, depth + 1);
      } else {
        this.printTest(child, depth + 1);
      }
    }
  }

  private printTest(test: TestCase, depth: number): void {
    const indent = '  '.repeat(depth);
    const result = test.result();
    const duration = test.diagnostic()?.duration;

    console.log(
      `${indent}${this.getTestSymbol(result.state)} ${this.getTestName(
        test,
        result.state,
      )}${this.getDuration(duration)}`,
    );
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
    return state === 'failed' ? chalk.red(test.name) : test.name;
  }

  private getDuration(duration?: number): string {
    return duration == null ? '' : chalk.gray(` (${Math.round(duration)} ms)`);
  }

  private getGroup(path: string): TestGroup {
    return (
      TEST_GROUPS.find((group) =>
        group.matches ? group.matches(path) : path.includes(group.path ?? ''),
      ) ?? {
        name: 'OTHER',
      }
    );
  }

  private getFeatureSection(path: string, groupName: string): FeatureSection | null {
    const group = TEST_GROUPS.find((group) => group.name === groupName);

    if (!group?.path) {
      return null;
    }

    const relativePath = path.split(group.path)[1];

    if (!relativePath) {
      return null;
    }

    const [rootFolder] = relativePath.split('/');

    return FEATURE_SECTIONS.find((section) => section.path === rootFolder) ?? null;
  }

  private getPathDepth(path: string, groupName: string): number {
    const group = TEST_GROUPS.find((group) => group.name === groupName);

    if (!group?.path) {
      return 0;
    }

    const relativePath = path.split(group.path)[1];

    if (!relativePath) {
      return Number.MAX_SAFE_INTEGER;
    }

    return relativePath.split('/').length;
  }

  private getFileName(path: string): string {
    return path.split('/').at(-1)?.replace('.spec.ts', '') ?? path;
  }

  private printSummary(modules: readonly TestModule[]): void {
    const tests = modules.flatMap((module) => [...module.children.allTests()]);

    const passedTests = tests.filter((test) => test.result().state === 'passed').length;

    const failedTests = tests.filter((test) => test.result().state === 'failed').length;

    const skippedTests = tests.filter((test) => test.result().state === 'skipped').length;

    const passedModules = modules.filter((module) => module.ok()).length;
    const failedModules = modules.length - passedModules;

    const suiteResults: string[] = [];

    if (failedModules > 0) {
      suiteResults.push(chalk.red(`${failedModules} failed`));
    }

    if (passedModules > 0) {
      suiteResults.push(chalk.green(`${passedModules} passed`));
    }

    const testResults: string[] = [];

    if (failedTests > 0) {
      testResults.push(chalk.red(`${failedTests} failed`));
    }

    if (passedTests > 0) {
      testResults.push(chalk.green(`${passedTests} passed`));
    }

    if (skippedTests > 0) {
      testResults.push(chalk.yellow(`${skippedTests} skipped`));
    }

    console.log(
      [
        `${chalk.bold('Test Files:')} ${suiteResults.join(', ')}, ${modules.length} total`,
        `${chalk.bold('Tests:')}      ${testResults.join(', ')}, ${tests.length} total`,
      ].join('\n'),
    );
  }
}

export default GroupedReporter;
