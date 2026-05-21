import { DatabaseSchema, TableDefinition } from './supabaseService';

export function generateDatabaseSchema(prompt: string): DatabaseSchema {
  // Esto vendría del LLM, pero aquí está la estructura
  const schema: DatabaseSchema = {
    tables: [],
  };

  return schema;
}

export function generatePrismaSchema(schema: DatabaseSchema): string {
  const models = schema.tables.map((table) => {
    const fields = table.columns.map((col) => {
      let field = `  ${col.name} ${mapToPrismaType(col.type)}`;
      
      if (col.isPrimary) field += ' @id @default(uuid())';
      if (!col.nullable && !col.default) field += '';
      if (col.isForeignKey && col.references) {
        field += ` @relation(fields: [${col.name}], references: [${col.references.column}])`;
      }
      
      return field;
    });

    return `model ${capitalize(table.name)} {
${fields.join('\n')}
${table.relationships?.map(r => `  ${r.table} ${capitalize(r.referencedTable)} @relation("${r.table}_${r.referencedTable}")`).join('\n') || ''}
}`;
  });

  return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

${models.join('\n\n')}`;
}

export function generateAPIRoutes(schema: DatabaseSchema) {
  const routes: { path: string; language: string; content: string }[] = [];

  schema.tables.forEach((table) => {
    const modelName = capitalize(table.name);
    const routeFile = `src/app/api/${table.name}/route.ts`;

    routes.push({
      path: routeFile,
      language: 'typescript',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs';

// GET /api/${table.name}
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const item = await prisma.${table.name}.findUnique({
        where: { id },
      });
      return NextResponse.json(item);
    }

    const items = await prisma.${table.name}.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ${table.name}' },
      { status: 500 }
    );
  }
}

// POST /api/${table.name}
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const item = await prisma.${table.name}.create({
      data: { ...body, userId },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create ${table.name}' },
      { status: 500 }
    );
  }
}

// PATCH /api/${table.name}
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const body = await req.json();
    const item = await prisma.${table.name}.update({
      where: { id, userId },
      data: body,
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update ${table.name}' },
      { status: 500 }
    );
  }
}

// DELETE /api/${table.name}
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.${table.name}.delete({
      where: { id, userId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete ${table.name}' },
      { status: 500 }
    );
  }
}`,
    });
  });

  return routes;
}

export function generateReactQueryHooks(schema: DatabaseSchema) {
  const hooks = schema.tables.map((table) => {
    const hookName = `use${capitalize(table.name)}`;
    return `
export function ${hookName}() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['${table.name}'],
    queryFn: async () => {
      const res = await fetch('/api/${table.name}');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/${table.name}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${table.name}'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(` + "`/api/${table.name}?id=${id}`" + `, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${table.name}'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(` + "`/api/${table.name}?id=${id}`" + `, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${table.name}'] });
    },
  });

  return {
    data,
    isLoading,
    error,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}`;
  });

  return {
    path: 'src/hooks/useDatabase.ts',
    language: 'typescript',
    content: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

${hooks.join('\n\n')}`,
  };
}

// Helpers
function mapToPrismaType(sqlType: string): string {
  const mapping: Record<string, string> = {
    'uuid': 'String',
    'text': 'String',
    'varchar': 'String',
    'int': 'Int',
    'bigint': 'BigInt',
    'boolean': 'Boolean',
    'timestamp': 'DateTime',
    'jsonb': 'Json',
    'decimal': 'Decimal',
    'float': 'Float',
  };
  return mapping[sqlType.toLowerCase()] || 'String';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}
