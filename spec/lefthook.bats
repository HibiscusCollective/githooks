#!/usr/bin/env bats

@test "lefthook is installed" {
  run lefthook version
  [ "$status" -eq 0 ]
}

@test "pre-commit hook runs successfully" {
  run lefthook run pre-commit
  [ "$status" -eq 0 ]
}
