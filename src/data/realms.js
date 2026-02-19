/**
 * Demo realm configurations.
 * Each realm defines a user profile as a 360° environment.
 */

export const REALMS = [
    {
        id: 'coder-realm',
        owner: 'Adit',
        avatar: '🧑‍💻',
        city: 'Delhi',
        timezone: 'Asia/Kolkata',
        panoramaColor: { h: 260, s: 80, l: 8 }, // Deep purple-dark base
        activity: 'coding',
        activityLabel: 'Shipping code',
        music: {
            title: 'Blinding Lights',
            artist: 'The Weeknd',
            playing: true
        },
        thoughts: [
            'ship it 🚀',
            'caffeine.exe loading...',
            '// TODO: sleep'
        ],
        photos: [
            { src: null, caption: 'Hackathon Finals 🏆', color: '#7c3aed' },
            { src: null, caption: 'Late night debug session', color: '#00f0ff' },
            { src: null, caption: 'Team celebration 🎉', color: '#ff2d95' }
        ],
        projects: [
            { icon: '🚀', name: 'Realms', desc: 'Spatial social network', link: '#' },
            { icon: '🤖', name: 'Satya.ai', desc: 'Legal AI platform', link: '#' },
            { icon: '🎮', name: 'PixelForge', desc: 'Game engine experiment', link: '#' }
        ],
        neonColor: '#00f0ff',
        gifts: [],
        cardBg: 'linear-gradient(135deg, #1a0a3e 0%, #0a1628 50%, #0f0a2e 100%)'
    },
    {
        id: 'artist-realm',
        owner: 'Maya',
        avatar: '🎨',
        city: 'Tokyo',
        timezone: 'Asia/Tokyo',
        panoramaColor: { h: 340, s: 70, l: 10 }, // Warm pink-dark base
        activity: 'listening',
        activityLabel: 'Vibing to music',
        music: {
            title: 'Weightless',
            artist: 'Marconi Union',
            playing: true
        },
        thoughts: [
            'art is never finished ✨',
            'colors speak louder',
            '🌸 wabi-sabi'
        ],
        photos: [
            { src: null, caption: 'Studio corner 🎨', color: '#ff2d95' },
            { src: null, caption: 'Gallery opening night', color: '#ffd700' },
            { src: null, caption: 'Kyoto morning 🌅', color: '#ff6b2b' }
        ],
        projects: [
            { icon: '🖼️', name: 'Chromatic', desc: 'Generative art series', link: '#' },
            { icon: '📱', name: 'MoodBoard', desc: 'Design inspiration app', link: '#' },
            { icon: '✏️', name: 'Sketch365', desc: 'Daily drawing challenge', link: '#' }
        ],
        neonColor: '#ff2d95',
        gifts: [],
        cardBg: 'linear-gradient(135deg, #2e0a1a 0%, #1a0a0f 50%, #2e1a1a 100%)'
    },
    {
        id: 'eakasv-realm',
        owner: 'Eakasv',
        avatar: '🐕',
        city: 'Delhi',
        timezone: 'Asia/Kolkata',
        panoramaColor: { h: 30, s: 65, l: 8 },
        activity: 'listening',
        activityLabel: 'Walking the pack',
        music: {
            title: 'Golden Hour',
            artist: 'JVKE',
            playing: true
        },
        thoughts: [
            'every dog has a story 🐾',
            'adopt, don\'t shop ❤️',
            'who rescued who?'
        ],
        realmPhotos: [
            { src: '/photos/eakasv/photo_1.jpeg', caption: 'Lost in thought 🐾', frame: 'polaroid' },
            { src: '/photos/eakasv/photo_2.jpeg', caption: 'Peek-a-boo champion', frame: 'neon' },
            { src: '/photos/eakasv/photo_3.jpeg', caption: 'Those eyes could melt anyone', frame: 'vintage' },
            { src: '/photos/eakasv/photo_4.jpeg', caption: 'Living room royalty 👑', frame: 'polaroid' },
            { src: '/photos/eakasv/photo_5.jpeg', caption: 'Curled up & cozy', frame: 'holographic' },
            { src: '/photos/eakasv/photo_6.jpeg', caption: 'Golden boy in his kingdom', frame: 'minimal' },
            { src: '/photos/eakasv/photo_7.jpeg', caption: 'Sunbathing mode: ON ☀️', frame: 'vintage' },
            { src: '/photos/eakasv/photo_8.jpeg', caption: 'Belly up, trust level 100', frame: 'pixel' },
            { src: '/photos/eakasv/photo_9.jpeg', caption: 'Deep thoughts 💭', frame: 'neon' },
            { src: '/photos/eakasv/photo_10.jpeg', caption: 'Those puppy eyes tho 🥺', frame: 'polaroid' },
            { src: '/photos/eakasv/photo_11.jpeg', caption: 'Street smart & heart-melting', frame: 'holographic' },
            { src: '/photos/eakasv/photo_12.jpeg', caption: 'Midnight fur, golden soul', frame: 'neon' },
            { src: '/photos/eakasv/photo_13.jpeg', caption: 'Snack time negotiations', frame: 'pixel' },
            { src: '/photos/eakasv/photo_14.jpeg', caption: 'Best friends forever 🤝', frame: 'vintage' },
            { src: '/photos/eakasv/photo_15.jpeg', caption: 'Sunday nap energy 😴', frame: 'minimal' },
        ],
        photos: [
            { src: null, caption: 'Good boy alert 🐕', color: '#ffa500' },
            { src: null, caption: 'Pawsome adventures', color: '#ff6b2b' },
            { src: null, caption: 'Doggo diaries 🐾', color: '#ffd700' }
        ],
        projects: [
            { icon: '🐾', name: 'PawPals', desc: 'Dog adoption platform', link: '#' },
            { icon: '📸', name: 'DogSnaps', desc: 'Pet photography gallery', link: '#' },
            { icon: '🦴', name: 'TreatTracker', desc: 'Pet health & nutrition', link: '#' }
        ],
        neonColor: '#ffa500',
        gifts: [],
        cardBg: 'linear-gradient(135deg, #2e1a0a 0%, #1a0f06 50%, #2e1f0a 100%)'
    },
    {
        id: 'adit-realm',
        owner: 'Adit',
        avatar: '🔥',
        city: 'Delhi',
        timezone: 'Asia/Kolkata',
        panoramaColor: { h: 0, s: 70, l: 8 },
        activity: 'listening',
        activityLabel: 'Vibing to Ye',
        music: {
            title: 'Stronger',
            artist: 'Kanye West',
            playing: true
        },
        thoughts: [
            'no one man should have all that power ⚡',
            'cruising through Delhi at midnight 🏎️',
            'sushi > everything 🍣'
        ],
        realmPhotos: [
            { src: '/photos/adit/photo_1.jpeg', caption: 'Tank vibes only 🪖', frame: 'neon' },
            { src: '/photos/adit/photo_2.jpeg', caption: 'Metro squad deep 🚇', frame: 'polaroid' },
            { src: '/photos/adit/photo_3.jpeg', caption: 'Boys in the metro', frame: 'vintage' },
            { src: '/photos/adit/photo_4.jpeg', caption: 'Ride or die 🏍️', frame: 'holographic' },
            { src: '/photos/adit/photo_5.jpeg', caption: 'Helmet on, world off', frame: 'minimal' },
            { src: '/photos/adit/photo_6.jpeg', caption: 'Green machine 🏎️', frame: 'neon' },
            { src: '/photos/adit/photo_7.jpeg', caption: 'Fresh wash, fresh start', frame: 'pixel' },
            { src: '/photos/adit/photo_8.jpeg', caption: 'Car meet madness 🔥', frame: 'polaroid' },
            { src: '/photos/adit/photo_9.jpeg', caption: 'Late night bites', frame: 'vintage' },
            { src: '/photos/adit/photo_10.jpeg', caption: 'Sunday brunch era 🍣', frame: 'holographic' },
            { src: '/photos/adit/photo_11.jpeg', caption: 'Sushi o\'clock 🥢', frame: 'minimal' },
        ],
        photos: [
            { src: null, caption: 'Speed demon 🏎️', color: '#ff4444' },
            { src: null, caption: 'Night cruiser', color: '#ff6b2b' },
            { src: null, caption: 'Ye season 🔥', color: '#ff0000' }
        ],
        projects: [
            { icon: '🏎️', name: 'AutoMeet', desc: 'Car enthusiast community', link: '#' },
            { icon: '🎵', name: 'YePlaylist', desc: 'Curated Kanye playlists', link: '#' },
            { icon: '🍣', name: 'FoodRun', desc: 'Late night food spots', link: '#' }
        ],
        neonColor: '#ff4444',
        gifts: [],
        cardBg: 'linear-gradient(135deg, #2e0a0a 0%, #1a0606 50%, #2e0a0a 100%)',
        timeCapsule: {
            unlockDate: '2026-03-15',
            title: '🔒 ADIT\'S TIME CAPSULE',
            hint: 'Something special drops on March 15...',
            content: 'First road trip memories from Rajasthan — coming soon 🏜️'
        }
    },
    {
        id: 'anya-realm',
        owner: 'Aanya',
        avatar: '🎨',
        city: 'Delhi',
        timezone: 'Asia/Kolkata',
        panoramaColor: { h: 280, s: 60, l: 8 },
        activity: 'coding',
        activityLabel: 'Painting a masterpiece',
        music: {
            title: 'Renaissance',
            artist: 'Beyoncé',
            playing: true
        },
        thoughts: [
            'art is the lie that tells the truth 🎨',
            'sunset chaser on the high seas 🚢',
            'no dscpln / no lmts / no prblm ✨'
        ],
        realmPhotos: [
            { src: '/photos/anya/photo_1.jpeg', caption: 'Renaissance vibes 🎨', frame: 'vintage' },
            { src: '/photos/anya/photo_2.jpeg', caption: 'Mirror mirror ✨', frame: 'neon' },
            { src: '/photos/anya/photo_3.jpeg', caption: 'Eureka moment 💡', frame: 'polaroid' },
            { src: '/photos/anya/photo_4.jpeg', caption: 'Night out in the city', frame: 'holographic' },
            { src: '/photos/anya/photo_5.jpeg', caption: 'Señorita vibes 🎉', frame: 'pixel' },
            { src: '/photos/anya/photo_6.jpeg', caption: 'Bienvenidos 🇲🇽', frame: 'vintage' },
            { src: '/photos/anya/photo_7.jpeg', caption: 'Noodle therapy 🍜', frame: 'minimal' },
            { src: '/photos/anya/photo_8.jpeg', caption: 'Cruise life ⛵', frame: 'polaroid' },
            { src: '/photos/anya/photo_9.jpeg', caption: 'Golden hour from the deck 🌅', frame: 'neon' },
            { src: '/photos/anya/photo_10.jpeg', caption: 'Park day with the squad', frame: 'holographic' },
            { src: '/photos/anya/photo_11.jpeg', caption: 'Inside jokes only 😂', frame: 'pixel' },
        ],
        photos: [
            { src: null, caption: 'Canvas queen 🎨', color: '#9b59b6' },
            { src: null, caption: 'Cruise diaries', color: '#e74c3c' },
            { src: null, caption: 'Art & soul', color: '#8e44ad' }
        ],
        projects: [
            { icon: '🎨', name: 'ArtFolio', desc: 'Digital art gallery', link: '#' },
            { icon: '✈️', name: 'Wanderlust', desc: 'Travel blog', link: '#' },
            { icon: '🍜', name: 'FoodieLog', desc: 'Food adventures', link: '#' }
        ],
        neonColor: '#9b59b6',
        gifts: [],
        cardBg: 'linear-gradient(135deg, #1a0a2e 0%, #0f061a 50%, #2e0a2e 100%)',
        timeCapsule: {
            unlockDate: '2026-04-01',
            title: '🔒 AANYA\'S TIME CAPSULE',
            hint: 'April surprise locked away...',
            content: 'Full Renaissance painting series reveal — stay tuned 🖼️'
        }
    }
];

export const VISITORS = [
    { name: 'Rohan', emoji: '😎' },
    { name: 'Priya', emoji: '🦋' },
    { name: 'Kai', emoji: '🔥' }
];

export const GIFTS_CATALOG = [
    { emoji: '☕', name: 'Coffee' },
    { emoji: '🌸', name: 'Flower' },
    { emoji: '🏆', name: 'Trophy' },
    { emoji: '🎸', name: 'Guitar' },
    { emoji: '💎', name: 'Diamond' },
    { emoji: '🍕', name: 'Pizza' },
    { emoji: '🎧', name: 'Music' },
    { emoji: '⚡', name: 'Energy' }
];

export const WEATHER_CONDITIONS = {
    rain: { icon: '🌧️', label: 'Rainy' },
    clear: { icon: '☀️', label: 'Clear' },
    clouds: { icon: '☁️', label: 'Cloudy' },
    snow: { icon: '❄️', label: 'Snowy' },
    night_clear: { icon: '🌙', label: 'Clear Night' },
    thunderstorm: { icon: '⛈️', label: 'Stormy' }
};
