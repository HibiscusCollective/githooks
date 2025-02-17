# frozen_string_literal: true

require 'minitest/autorun'

require_relative '../../../scripts/src/script'

class TestUsageScript < Script::BaseScript
  USAGE = 'Test Usage'
end

class SpyScript < Script::BaseScript
  def execute(args, opts)
    @args = args
    @opts = opts
  end

  attr_reader :args, :opts
end

class ScriptTest < Minitest::Test
  def test_raises_error_when_execute_is_not_implemented
    assert_raises(NotImplementedError) { Script::Runner.new(Script::BaseScript.new).run }
  end

  # def test_prints_usage_when_help_is_called
  #   stderr = StringIO.new

  #   Script::Runner.new(TestUsageScript.new(stderr)).help

  #   assert_equal("#{TestUsageScript::USAGE}\n", stderr.string)
  # end

  # def test_parses_arguments
  #   script = SpyScript.new

  #   Script::Runner.new(script).run(%w[foo bar baz])

  #   assert_equal(%w[foo bar baz], script.args)
  #   assert_empty(script.opts)
  # end

  # def test_parses_options
  #   script = SpyScript.new

  #   Script::Runner.new(script).run('--a 1 2 3 --b "hello, world!"')

  #   assert_equal({ a: [1, 2, 3], b: 'hello, world!' }, script.opts)
  #   assert_empty(script.args)
  # end

  # def test_parses_options_and_args
  #   script = SpyScript.new
  #   Script::Runner.new(script).run('--a 1 2 3 --b "test" foo bar baz')

  #   assert_equal(%w[foo bar baz], script.args)
  #   assert_equal({ a: [1, 2, 3], b: 'test' }, script.opts)
  # end
end
