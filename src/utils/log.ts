import chalk from 'chalk';

export function    info(message: string): void { console.info(chalk.blue('🛈 ' + message)); }
export function success(message: string): void { console.log(chalk.green('✓ ' + message)); }
export function failure(message: string): void { console.error(chalk.red('✗ ' + message)); }
