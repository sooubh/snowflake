import { NextResponse } from 'next/server';
import { snowflakeService as azureService } from '@/lib/snowflakeService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');

        let items;
        if (section) {
            items = await azureService.getAllItems(section);
        } else {
            items = await azureService.getGlobalItems();
        }

        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.price || !body.quantity) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newItem = await azureService.addItem({
            name: body.name,
            category: body.category || 'General',
            quantity: Number(body.quantity),
            price: Number(body.price),
            status: body.quantity > 100 ? 'In Stock' : body.quantity > 0 ? 'Low Stock' : 'Out of Stock',
            ownerId: body.ownerId,
            section: body.section,
            expiryDate: body.expiryDate,
            manufacturingDate: body.manufacturingDate,
            batchNumber: body.batchNumber,
            supplier: body.supplier,
            description: body.description,
            unit: body.unit
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }
}
