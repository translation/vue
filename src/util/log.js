import chalk from 'chalk'

const print = (color) => (...str) => {
    console.log(color(str))
}

export const info = print(chalk.cyan)
export const success = print(chalk.green)
export const warn = print(chalk.yellow)
export const error = print(chalk.red)
export const verbose = print(chalk.magenta)