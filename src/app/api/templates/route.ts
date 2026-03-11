import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { defaultTemplates } from '@/lib/templates';

// GET /api/templates - Get all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Check if templates exist in DB
    let templates = await db.template.findMany({
      where: {
        ...(category ? { category } : {}),
      },
      orderBy: { usageCount: 'desc' },
    });

    // If no templates in DB, seed default templates
    if (templates.length === 0) {
      for (const template of defaultTemplates) {
        await db.template.create({
          data: {
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            icon: template.icon,
            color: template.color,
            structure: JSON.stringify(template.structure),
            isPublic: true,
          },
        });
      }
      
      templates = await db.template.findMany({
        where: {
          ...(category ? { category } : {}),
        },
        orderBy: { usageCount: 'desc' },
      });
    }

    // Add parsed structure to each template
    const templatesWithStructure = templates.map((t) => ({
      ...t,
      structure: JSON.parse(t.structure),
    }));

    return NextResponse.json({ success: true, data: templatesWithStructure });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create custom template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, icon, color, structure, isPublic } = body;

    const template = await db.template.create({
      data: {
        name,
        description,
        category,
        icon,
        color: color || '#6366f1',
        structure: JSON.stringify(structure),
        isPublic: isPublic || false,
      },
    });

    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
