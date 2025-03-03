#!/usr/bin/env node
import server from './index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { program } from 'commander'
import { generateQRCode } from './qrcode.js'
import { writeFile } from 'fs/promises'
import { promisify } from 'util'
import { exec } from 'child_process'
import path from 'path'

const execAsync = promisify(exec)

// Check if we have stdin data (piped input)
const hasStdin = !process.stdin.isTTY

// Configure the main CLI
program.name('mcp-server-qrcode').description('MCP server for generating QR codes').version('0.3.6')

// Generate command
program
  .command('generate')
  .description('Generate a QR code')
  .option('-c, --content <content>', 'Content to encode in the QR code')
  .option('-s, --size <size>', 'Size of the QR code (100-1000 pixels)', '200')
  .option('-e, --error-correction <level>', 'Error correction level (L, M, Q, H)', 'M')
  .option('-o, --output <file>', 'Output file path (defaults to terminal output)')
  .option('-f, --format <format>', 'Output format (text or image)', 'text')
  .action(async options => {
    try {
      const content = options.content
      if (!content) {
        console.error('Error: No content provided for QR code generation')
        process.exit(1)
      }

      const size = parseInt(options.size, 10)
      const format = options.format === 'image' ? 'base64' : 'terminal'

      // Generate QR code
      const result = await generateQRCode({
        content,
        size,
        errorCorrectionLevel: options.errorCorrection as 'L' | 'M' | 'Q' | 'H',
        format,
      })

      // Handle output
      if (options.output) {
        if (format === 'base64') {
          // Write image to file
          const buffer = Buffer.from(result.data, 'base64')
          await writeFile(options.output, buffer)
          console.log(`QR code image saved to ${options.output}`)
        } else {
          // Write text to file
          await writeFile(options.output, result.data)
          console.log(`QR code text saved to ${options.output}`)
        }
      } else {
        // Output to terminal
        console.log(result.data)
      }
    } catch (error) {
      console.error(
        'Error generating QR code:',
        error instanceof Error ? error.message : String(error)
      )
      process.exit(1)
    }
  })

// Resource command
program
  .command('resource <uri>')
  .description('Generate QR code from MCP resource URI')
  .option('-o, --output <file>', 'Output file path (defaults to terminal display)')
  .option('-v, --view', 'View the generated QR code image immediately (if supported)')
  .action(async (uri, options) => {
    try {
      // Validate URI format
      if (!uri.startsWith('qrcode://')) {
        console.error('Error: Resource URI must start with qrcode://')
        console.log('Examples:')
        console.log('  qrcode://sample')
        console.log('  qrcode://hello-world')
        console.log('  qrcode://https://example.com?size=300&level=H')
        process.exit(1)
      }

      // Determine resource type and parameters
      let resourceUri = uri
      let isSampleResource = false
      let content = ''
      let size = 200
      let errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M'

      if (uri === 'qrcode://sample') {
        isSampleResource = true
      } else {
        // Custom resource - Extract content and parameters from the URI
        const contentMatch = uri.match(/^qrcode:\/\/(.+?)(?:\?|$)/)
        content = contentMatch ? contentMatch[1] : ''

        // Extract query parameters
        const queryString = uri.includes('?') ? uri.split('?')[1] : ''
        const queryParams = new URLSearchParams(queryString)

        // Parse size parameter if present
        if (queryParams.has('size')) {
          const sizeParam = parseInt(queryParams.get('size')!, 10)
          if (!isNaN(sizeParam)) {
            size = sizeParam
          }
        }

        // Parse error correction level if present
        const levelParam = queryParams.get('level')
        if (levelParam && ['L', 'M', 'Q', 'H'].includes(levelParam)) {
          errorCorrectionLevel = levelParam as 'L' | 'M' | 'Q' | 'H'
        }
      }

      // Generate QR code directly based on requested resource
      let result: {
        contents: { text: string; uri: string; blob: string; mimeType: string }[]
        isError?: boolean
      }

      if (isSampleResource) {
        // Sample QR code
        const qrResult = await generateQRCode({
          content: 'https://github.com/jwalsh/mcp-server-qrcode',
          size: 200,
          errorCorrectionLevel: 'M',
          format: 'base64',
        })

        // Create a formatted result mimicking the resource API
        result = {
          contents: [
            {
              text: 'Sample QR Code for MCP QR Code Server',
              uri: 'qrcode://sample',
              blob: qrResult.data,
              mimeType: 'image/png',
            },
          ],
        }
      } else {
        // Custom QR code
        if (!content) {
          console.error('Error: Content parameter is required')
          process.exit(1)
        }

        try {
          // Generate QR code
          const qrResult = await generateQRCode({
            content: decodeURIComponent(content),
            size,
            errorCorrectionLevel,
            format: 'base64',
          })

          // Create a formatted result mimicking the resource API
          result = {
            contents: [
              {
                text: `QR Code for "${decodeURIComponent(content)}"`,
                uri: resourceUri,
                blob: qrResult.data,
                mimeType: 'image/png',
              },
            ],
          }
        } catch (error) {
          console.error(
            'Error generating QR code:',
            error instanceof Error ? error.message : String(error)
          )
          process.exit(1)
        }
      }

      if (result.isError) {
        console.error('Error:', result.contents[0].text)
        process.exit(1)
      }

      // Find image content in the result
      const imageContent = result.contents.find(
        item => item.blob && item.mimeType?.includes('image')
      )

      if (!imageContent) {
        console.error('Error: No image content found in resource result')
        process.exit(1)
      }

      // Handle output options
      if (options.output) {
        // Write image to file
        const buffer = Buffer.from(imageContent.blob, 'base64')
        await writeFile(options.output, buffer)
        console.log(`QR code image saved to ${options.output}`)

        // Open image if view flag is set
        if (options.view) {
          try {
            const absolutePath = path.resolve(options.output)

            // Try to open with different commands based on platform
            if (process.platform === 'darwin') {
              await execAsync(`open "${absolutePath}"`)
            } else if (process.platform === 'win32') {
              await execAsync(`start "" "${absolutePath}"`)
            } else {
              await execAsync(`xdg-open "${absolutePath}"`)
            }
          } catch (error) {
            console.error(
              'Failed to open image:',
              error instanceof Error ? error.message : String(error)
            )
          }
        }
      } else {
        // No output file, print information
        console.log('QR Code generated successfully.')
        console.log('Resource URI:', uri)
        console.log('Use --output flag to save the QR code as an image file.')
      }
    } catch (error) {
      console.error(
        'Error generating resource:',
        error instanceof Error ? error.message : String(error)
      )
      process.exit(1)
    }
  })

// Server command (default)
program
  .command('server')
  .description('Start the QR Code MCP server (default if no command is specified)')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async options => {
    try {
      const verbose = options.verbose || false
      console.log(`Starting QR Code MCP server with verbose: ${verbose}`)

      // Create a stdio transport for the server
      const transport = new StdioServerTransport()

      // Connect the server to the transport
      await server.connect(transport)

      console.log('QR Code MCP server is running')
    } catch (error) {
      console.error(
        'Failed to start server:',
        error instanceof Error ? error.message : String(error)
      )
      process.exit(1)
    }
  })

// Handle stdin piping
if (hasStdin) {
  let inputData = ''

  process.stdin.on('data', chunk => {
    inputData += chunk
  })

  process.stdin.on('end', async () => {
    try {
      const content = inputData.trim()
      if (!content) {
        console.error('Error: No content provided for QR code generation')
        process.exit(1)
      }

      // Generate QR code in terminal-friendly format
      const result = await generateQRCode({
        content,
        size: 200,
        errorCorrectionLevel: 'M',
        format: 'terminal',
      })

      // Output the QR code to the terminal
      console.log(result.data)
    } catch (error) {
      console.error(
        'Error generating QR code:',
        error instanceof Error ? error.message : String(error)
      )
      process.exit(1)
    }
  })
} else {
  // Handle older CLI interface for backward compatibility
  program
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-g, --generate <content>', 'Generate QR code from the provided content')
    .option('-s, --size <size>', 'Size of the QR code (100-1000 pixels)', '200')
    .option('-e, --error-correction <level>', 'Error correction level (L, M, Q, H)', 'M')

  // Support original behavior for backward compatibility
  program.action(async options => {
    // Backward compatibility for old CLI interface
    if (options.generate) {
      const result = await generateQRCode({
        content: options.generate,
        size: parseInt(options.size, 10),
        errorCorrectionLevel: options.errorCorrection as 'L' | 'M' | 'Q' | 'H',
        format: 'terminal',
      })
      console.log(result.data)
    } else if (!program.args.length || program.args[0] === 'server') {
      // Start in server mode if no other command or specifically server command
      const verbose = options.verbose || false
      console.log(`Starting QR Code MCP server with verbose: ${verbose}`)

      // Create a stdio transport for the server
      const transport = new StdioServerTransport()

      // Connect the server to the transport
      await server.connect(transport)

      console.log('QR Code MCP server is running')
    }
  })

  // Parse command line arguments
  program.parse()
}
