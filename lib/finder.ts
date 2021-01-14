import fs from 'fs'
import path from 'path'

function getRulesDir(suite: string) {
  if (!fs.existsSync(suite)) {
    throw `Suite path "${suite}" does not exist.`
  }

  if (!fs.lstatSync(suite).isDirectory()) {
    throw `Suite path "${suite}" must be a directory.`
  }

  const package_json = path.join(suite, 'package.json');
  if (!fs.existsSync(package_json)) {
    throw `Incorrect suite "${suite}" - "${package_json}" does not exist.`
  }

  if (!fs.lstatSync(package_json).isFile()) {
    throw `Incorrect suite "${suite}" - "${package_json}" must be a file.`
  }

  const config = JSON.parse(fs.readFileSync(package_json).toString())

  if (!config.rules) {
    throw `Incorrect suite "${suite}" - in "${package_json}" the "rules" config missing or empty.`
  }

  const rules_dir = path.join(suite, config.rules)

  if (!fs.existsSync(rules_dir)) {
    throw `Incorrect suite "${suite}" - rules dir "${rules_dir}" does not exist.`
  }

  if (!fs.lstatSync(rules_dir).isDirectory()) {
    throw `Incorrect suite "${suite}" - rules dir "${rules_dir}" must be a directory.`
  }

  return rules_dir
}

export default (suite: string): string[][] => {
  const rules_dir = getRulesDir(suite)

  const suite_rule_paths = []
  const paths_to_visit = [rules_dir]

  while (paths_to_visit.length) {
    const rule_path = paths_to_visit.pop()

    for (const listing of fs.readdirSync(rule_path)) {
      const next_visit = path.join(rule_path, listing)

      if (fs.lstatSync(next_visit).isDirectory()) {
        paths_to_visit.push(next_visit)
      } else if (listing.match('\.rule\.ts$')) {
        suite_rule_paths.push([rules_dir, next_visit])
      }
    }
  }

  return suite_rule_paths
}
