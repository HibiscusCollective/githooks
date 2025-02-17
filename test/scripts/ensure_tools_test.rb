# frozen_string_literal: true

require 'minitest/autorun'
require 'minitest/pride'
require 'open3'

require_relative '../../scripts/ensure_tools'

class EnsureToolsTest < Minitest::Test
  def test_should_raise_argument_error_when_no_tools_are_specified
    error = assert_raises(ArgumentError) do
      EnsureTools.ensure([])
    end
    assert_equal 'No tools specified', error.message
  end

  def test_should_raise_argument_error_when_list_tool_versions_fails
    EnsureTools.list_tool_versions = ->(*) { raise StandardError, 'boom' }

    error = assert_raises(StandardError) do
      EnsureTools.ensure(['cool tool'])
    end
    assert_equal 'boom', error.message
  end
end
