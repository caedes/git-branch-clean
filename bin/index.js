#!/usr/bin/env node

const { spawnSync } = require("child_process");
const { without } = require("ramda");
const inquirer = require("inquirer");

const cmdBufferToArray = buffer =>
  buffer.stdout
    .toString()
    .split("\n")
    .map(line => line.trim());

const localBranchesCmd = spawnSync("git", ["branch"]);
const remoteBranchesCmd = spawnSync("git", ["branch", "-r"]);

const localBranches = cmdBufferToArray(localBranchesCmd);
const remoteBranches = cmdBufferToArray(remoteBranchesCmd);

const branchesToRemove = without(
  ["* master"],
  localBranches.filter(branch => !remoteBranches.includes(branch))
);

const choices = branchesToRemove.map(branch => ({
  name: branch,
  checked: true
}));

inquirer
  .prompt([
    {
      type: "checkbox",
      name: "selectedBranches",
      message:
        "All this branches do not have corresponding remote ones.\nDo you want them to be removed?",
      choices,
      pageSize: 25
    }
  ])
  .then(answers => {
    spawnSync("git", ["branch", "-D", ...answers.selectedBranches]);
    console.log("All selected branches removed.");
  });
