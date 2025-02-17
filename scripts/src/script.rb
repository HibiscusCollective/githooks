# frozen_string_literal: true

require 'stringio'
require 'optparse'

# Script module contains the common functionality for running scripts
module Script
  # BaseScript is an abstract class that all scripts must inherit from
  class BaseScript
    USAGE = "Usage: #{$PROGRAM_NAME}".freeze

    def initialize(stdout = $stdout, stderr = $stderr)
      @stdout = stdout
      @stderr = stderr
    end

    def help
      @stderr.puts(USAGE)
    end

    def execute(args, opts)
      raise NotImplementedError, 'Must implement execute(args)'
    end

    def parse_options(opts)
      raise NotImplementedError, 'Must implement parse_options(opts)'
    end
  end

  # Runner runs an instance of a script
  class Runner
    def initialize(script)
      @script = script
    end

    def run(args = ARGV)
      args, opts = parse_args(args)
      @script.execute(args, opts)
    end

    def help
      @script.help
    end

    private

    def parse_args(args)
      [[], {}]
    end
  end
end
