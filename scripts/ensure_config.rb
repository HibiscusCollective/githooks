#!ruby
# frozen_string_literal: true

require 'optparse'

options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: #{$PROGRAM_NAME} [options]"

  opts.on('-o', '--output FILE', 'Output file path') { |v| options[:output] = v }
  opts.on('-i', '--input FILE', 'Input file path') { |v| options[:input] = v }
end.parse!

if options[:output].nil? || options[:input].nil?
  puts 'Error: Both --output and --input flags are required.'
  puts "Usage: #{$PROGRAM_NAME} --output OUTPUT_FILE --input INPUT_FILE"
  exit 1
end

output_file = options[:output]
input_file = options[:input]

output_dir = File.dirname(output_file)
Dir.mkdir(output_dir) unless Dir.exist?(output_dir)

File.write(output_file, File.read(input_file))
