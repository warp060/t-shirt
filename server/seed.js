const pool = require('./db');

const products = [
    {
        name: "Midnight Noir Essential Tee",
        price: 1299.00,
        description: "A premium jet-black essential tee made from 100% long-staple cotton. Features a tailored fit that remains crisp after every wash.",
        category: "Men",
        image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
        stock: 100
    },
    {
        name: "Arctic White Oversized Tee",
        price: 1899.00,
        description: "Heavyweight cotton in a pristine arctic white finish. The perfect relaxed silhouette for a modern, minimalist look.",
        category: "Oversized",
        image_url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
        stock: 75
    },
    {
        name: "Sage Green Comfort Hoodie",
        price: 2499.00,
        description: "Ultra-soft fleece hoodie in a calming sage green. Double-lined hood and reinforced stitching for ultimate longevity.",
        category: "Oversized",
        image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
        stock: 50
    },
    {
        name: "Crimson Peak Graphic Print",
        price: 2199.00,
        description: "A bold, artistic graphic inspired by mountain peaks at sunset. High-definition DTG print on premium obsidian fabric.",
        category: "Printed",
        image_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
        stock: 60
    },
    {
        name: "Lavender Breeze Crop Top",
        price: 1499.00,
        description: "Lightweight and breathable crop tee for women. Features a soft lavender hue perfect for summer layering.",
        category: "Women",
        image_url: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80",
        stock: 85
    },
    {
        name: "Desert Sand Relaxed Polo",
        price: 1699.00,
        description: "A sophisticated take on the classic polo. Earthy sand tones with a modern, structured collar and premium knit texture.",
        category: "Men",
        image_url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
        stock: 40
    },
    {
        name: "Golden Hour Streetwear Hoodie",
        price: 2999.00,
        description: "Capturing the glow of the golden hour. A warm, vibrant orange oversized hoodie that makes a statement.",
        category: "Oversized",
        image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
        stock: 30
    },
    {
        name: "Urban Jungle Abstract Print",
        price: 2299.00,
        description: "An abstract jungle motif in deep forest greens and charcoal. Designed for those who stand out.",
        category: "Printed",
        image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
        stock: 45
    },
    {
        name: "Shadow Boxy Fit Tee",
        price: 1799.00,
        description: "Wide sleeves and a structured drop-shoulder fit. Heavy 240 GSM cotton in deep charcoal shadow.",
        category: "Oversized",
        image_url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
        stock: 90
    },
    {
        name: "Vintage Rose Thread Work",
        price: 1999.00,
        description: "Exquisite hand-finished thread work on a vintage rose pink base. A fusion of tradition and contemporary style.",
        category: "Women",
        image_url: "https://images.unsplash.com/photo-1571945153237-4929e783ee4a?auto=format&fit=crop&w=800&q=80",
        stock: 25
    },
    {
        name: "Oceanic Blue Linen Shirt",
        price: 2899.00,
        description: "Premium linen-blend shirt for maximum breathability. Features a unique deep sea blue dye and mother-of-pearl buttons.",
        category: "Men",
        image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
        stock: 35
    },
    {
        name: "Velvet Night Premium Hoodie",
        price: 3499.00,
        description: "Our most luxurious hoodie. Velvet-touch finish on heavy-duty cotton. Interior is brushed for unparalleled comfort.",
        category: "Oversized",
        image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
        stock: 20
    }
];

async function seed() {
    try {
        console.log('Clearing existing products...');
        await pool.execute('DELETE FROM products');
        
        console.log('Seeding new premium collection...');
        for (const product of products) {
            await pool.execute(
                'INSERT INTO products (name, price, description, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)',
                [product.name, product.price, product.description, product.category, product.image_url, product.stock]
            );
        }
        
        console.log('Database seeded successfully with 12 premium products!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
