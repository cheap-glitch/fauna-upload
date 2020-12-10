import chalk from 'chalk';

export function success(message: string): void { console.log(chalk.green('✓ ' + message)); }
export function   error(message: string): void { console.error(chalk.red('✗ ' + message)); }
export function    info(message: string): void { console.info(chalk.blue('🛈 ' + message)); }
