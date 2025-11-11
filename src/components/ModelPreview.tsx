'use client';

import React from 'react';
import { FullConfig } from '@/lib/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ModelPreviewProps {
  config: Partial<FullConfig>;
}

export function ModelPreview({ config }: ModelPreviewProps) {
  const jsonString = JSON.stringify(config.models || [], null, 2);

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>JSON Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs text-zinc-300 overflow-auto max-h-[600px] bg-black/30 p-4 rounded-lg border border-white/10">
          {jsonString}
        </pre>
      </CardContent>
    </Card>
  );
}
