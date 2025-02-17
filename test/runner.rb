# frozen_string_literal: true

require 'rubygems'
require 'minitest/reporters'

Minitest::Reporters.use!

warn('No test files specified') if ARGV.empty?

ARGV.each do |arg|
  if File.file?(arg)
    require_relative File.join(Dir.pwd, arg)
  else
    Dir.glob(arg).sort.each { |file| require_relative File.join(Dir.pwd, file) if file.end_with?('_test.rb') }
  end
end
