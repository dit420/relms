/**
 * ITEMS - Catalog of customization items for the Marketplace.
 * currency: 'aura'
 */

export const ITEMS = {
    themes: [
        {
            id: 'theme_midnight',
            name: 'Midnight Void',
            price: 0,
            description: 'The classic deep space experience.',
            previewColor: '#0a0a0f',
            type: 'theme',
            data: {
                panorama: '#000000',
                isNight: true
            }
        },
        {
            id: 'theme_sunset',
            name: 'Cyber Sunset',
            price: 150,
            description: 'Warm gradients and relaxing vibes.',
            previewColor: '#ff6b2b',
            type: 'theme',
            data: {
                panorama: '#2d1b2e',
                isNight: false
            }
        },
        {
            id: 'theme_matrix',
            name: 'The Matrix',
            price: 300,
            description: 'Digital rain and green hues.',
            previewColor: '#00ff00',
            type: 'theme',
            data: {
                panorama: '#001a00',
                isNight: true
            }
        },
        {
            id: 'theme_nebula',
            name: 'Nebula Drift',
            price: 500,
            description: 'A swirl of cosmic colors.',
            previewColor: '#7c3aed',
            type: 'theme',
            data: {
                panorama: '#1a0a2e',
                isNight: true
            }
        }
    ],
    frames: [
        {
            id: 'frame_minimal',
            name: 'Minimalist',
            price: 0,
            description: 'Clean and simple.',
            previewClass: 'frame-minimal',
            type: 'frame',
            cssClass: ''
        },
        {
            id: 'frame_neon_gold',
            name: 'Neon Gold',
            price: 200,
            description: 'Luxurious glowing borders.',
            previewClass: 'frame-gold',
            type: 'frame',
            cssClass: 'frame-gold'
        },
        {
            id: 'frame_hologram',
            name: 'Holographic',
            price: 350,
            description: 'Glitchy tech borders.',
            previewClass: 'frame-holo',
            type: 'frame',
            cssClass: 'frame-holo'
        },
        {
            id: 'frame_retro',
            name: 'Retro Wood',
            price: 150,
            description: 'Old school cool.',
            previewClass: 'frame-wood',
            type: 'frame',
            cssClass: 'frame-wood'
        }
    ]
};
