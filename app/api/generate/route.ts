import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { fullConfigSchema } from '@/lib/schemas';
import { generateProjectFiles } from '@/lib/generator/index';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = fullConfigSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const config = validationResult.data;

    // Generate project files
    const files = await generateProjectFiles(config);

    // Create ZIP file
    const zip = new JSZip();

    // Add all generated files to the ZIP
    for (const file of files) {
      zip.file(file.path, file.content);
    }

    // Generate ZIP binary
    const zipBlob = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    // Return ZIP file as response
    return new NextResponse(zipBlob as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${config.projectName}.zip"`,
        'Content-Length': zipBlob.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating project:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate project',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
