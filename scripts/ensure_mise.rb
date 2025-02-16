#!ruby
# frozen_string_literal: true

unless system('command -v mise >/dev/null 2>&1')
  abort('mise is not installed, please visit https://mise.jdx.dev/getting-started.html for installation instructions')
end

abort('failed to run mise install, tools may not be properly set up') unless system('mise install')
