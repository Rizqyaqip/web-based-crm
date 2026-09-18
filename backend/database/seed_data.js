const initialProducts = [
  // 1. ketsai original
  [
    'nge-dimsum',
    'Dimsum kukus premium dengan olahan daging ayam dan udang pilihan yang lembut, berpadu saus sambal khas Ketsai yang menggoda.',
    'ketsai original',
    '/src/assets/ketsaiOriginal/dimsum.png',
    15000,
    35
  ],
  [
    'nge-bakso',
    'Bakso daging sapi kenyal dan gurih dalam siraman kuah kaldu rempah hangat beraroma bawang goreng yang lezat.',
    'ketsai original',
    '/src/assets/ketsaiOriginal/bakso.png',
    15000,
    30
  ],
  [
    'nyoto ayam',
    'Soto ayam berkuah kaldu kuning harum rempah nusantara dengan suwiran ayam empuk, bihun, dan taburan daun seledri segar.',
    'ketsai original',
    '/src/assets/ketsaiOriginal/sotoAyam.png',
    15000,
    25
  ],
  [
    'nyoto betawi',
    'Soto Betawi otentik kuah santan susu gurih rempah kaya rasa, berpadu potongan daging lezat dan emping renyah.',
    'ketsai original',
    '/src/assets/ketsaiOriginal/sotoBetawi.png',
    18000,
    25
  ],
  [
    'nyoto seger',
    'Soto bening khas Boyolali dengan kaldu sapi jernih segar, irisan daging empuk, serta perasan jeruk nipis yang menyegarkan.',
    'ketsai original',
    '/src/assets/ketsaiOriginal/sotoSeger.png',
    15000,
    25
  ],
  [
    'nge-tahubaso',
    'Tahu bakso khas Semarang berbahan tahu gurih berisi olahan daging sapi padat dan lezat, nikmat dinikmati bersama cabai rawit.',
    'ketsai original',
    '/src/assets/ketsaiOriginal/tahuBakso.png',
    10000,
    40
  ],
  [
    'ngolang-kaling',
    'Manisan kolang-kaling kenyal manis alami dengan aroma pandan wangi, sajian penutup tradisional yang menyegarkan dahaga.',
    'ketsai original',
    '/src/assets/ketsaiOriginal/kolangKaling.png',
    14000,
    30
  ],
  [
    'nyeblak',
    'Seblak pedas aromatik khas Bandung berkuah kencur pedas gurih nampol berisi kerupuk basah kenyal, telur, dan bakso.',
    'ketsai original',
    '/src/assets/ketsaiOriginal/seblak.png',
    10000,
    35
  ],
  [
    'ngebwah',
    'Aneka buah potong tropis segar higienis kualitas pilihan, dingin dan kaya vitamin untuk menyegarkan setiap momen bersantap.',
    'ketsai original',
    '/src/assets/ketsaiOriginal/buahPotong.png',
    10000,
    30
  ],

  // 2. frozen food
  [
    'Edo Fish Ball (250 gr)',
    'Bakso ikan olahan daging ikan segar pilihan bertekstur kenyal dan gurih alami, praktis untuk sajian sup hangat maupun hidangan steamboat.',
    'frozen food',
    '/src/assets/frozenFood/edoFishBall.png',
    29000,
    20
  ],
  [
    'Edo Crab Flavoured Stick (250 gr)',
    'Stik olahan rasa kepiting premium dengan serat daging lembut dan lezat, cocok untuk camilan, shabu-shabu, atau campuran salad.',
    'frozen food',
    '/src/assets/frozenFood/edoCrabFlavouredStick.png',
    40000,
    20
  ],
  [
    'Edo Ebi Furai',
    'Udang utuh segar berbalut tepung roti krispi ala bento Jepang, renyah keemasan di luar dan manis juicy di dalam saat digoreng.',
    'frozen food',
    '/src/assets/frozenFood/edoEbiFurai.png',
    40000,
    25
  ],
  [
    'Edo Fish Cake (250 gr)',
    'Kue ikan olahan lezat khas Jepang bertekstur kenyal lembut, pelengkap istimewa untuk aneka sajian mie ramen, udon, atau oden.',
    'frozen food',
    '/src/assets/frozenFood/edoFishCake.png',
    33000,
    15
  ],
  [
    'Edo Ebi Katsu',
    'Patty udang cincang gurih berbalut remah tepung roti renyah, nikmat dijadikan hidangan katsu burger atau lauk pendamping nasi hangat.',
    'frozen food',
    '/src/assets/frozenFood/edoEbiKatsu.png',
    30000,
    20
  ],
  [
    'Golden Farm Mixed Vegetables (500 gr)',
    'Kombinasi sayuran beku segar (wortel dadu, jagung manis, kacang polong) tanpa pengawet, kaya serat dan praktis untuk sup atau tumisan.',
    'frozen food',
    '/src/assets/frozenFood/goldenFarmMixedVegetables.png',
    35000,
    25
  ],
  [
    'Golden Farm Frozen Peas (1 kg)',
    'Kacang polong hijau manis pilihan berkualitas tinggi yang dipetik saat puncak kesegaran, cocok untuk masakan oriental maupun western.',
    'frozen food',
    '/src/assets/frozenFood/goldenFarmFrozenPeas.png',
    55000,
    15
  ],
  [
    'Golden Farm Corn Kernel (500 gr)',
    'Bulir jagung manis pipil segar kualitas premium pilihan, praktis untuk membuat jasuke, bakwan jagung manis, atau campuran sup hangat.',
    'frozen food',
    '/src/assets/frozenFood/goldenFarmCornKernel.png',
    27000,
    25
  ],
  [
    'Just Fry French Fries Crinkle Cut (450 gr)',
    'Kentang goreng beku potongan gelombang (crinkle cut) renyah gurih keemasan di luar dan lembut di dalam setelah digoreng.',
    'frozen food',
    '/src/assets/frozenFood/justFryFrenchFriesCrinkleCut.png',
    34000,
    30
  ],
  [
    'Just Fry French Fries Straight Cut (450 gr)',
    'Kentang goreng potongan lurus klasik renyah keemasan, camilan favorit keluarga yang sangat pas disantap bersama saus sambal atau mayones.',
    'frozen food',
    '/src/assets/frozenFood/justFryFrenchFriesStraightCut.png',
    24000,
    30
  ],

  // 3. ice cream
  [
    'Blue Lemonade',
    'Es krim stik segar rasa perpaduan lemon asam manis menyegarkan dengan sensasi dingin warna biru ceria pelepas dahaga.',
    'ice cream',
    '/src/assets/iceCream/blueLemonade.png',
    3500,
    50
  ],
  [
    'Cookie Creamy Stick',
    'Es krim vanila lembut bertabur remah biskuit cokelat gurih di atas stik praktis yang disukai oleh anak-anak maupun dewasa.',
    'ice cream',
    '/src/assets/iceCream/cookieCreamyStick.png',
    4000,
    45
  ],
  [
    'Korean Shine Muscat',
    'Es krim rasa anggur Shine Muscat khas Korea yang manis harum elegan dengan sensasi rasa buah mewah dan menyegarkan.',
    'ice cream',
    '/src/assets/iceCream/koreanShineMuscat.png',
    4000,
    40
  ],
  [
    'Fantazee Choco Milk',
    'Es krim stik perpaduan cokelat pekat dan susu lembut creamy yang memanjakan lidah di setiap gigitannya.',
    'ice cream',
    '/src/assets/iceCream/fantazeeChocoMilk.png',
    2500,
    50
  ],
  [
    'Mini Neapolitan (160 ml)',
    'Es krim cup klasik tiga rasa legendaris: cokelat kaya rasa, vanila lembut, dan stroberi manis segar dalam satu kemasan hemat.',
    'ice cream',
    '/src/assets/iceCream/miniNeapolitan.png',
    10000,
    25
  ],
  [
    'My Cup Choco Strawberry',
    'Es krim cup kombinasi lembut rasa cokelat manis dan asam segar buah stroberi dalam porsi personal yang pas untuk santai.',
    'ice cream',
    '/src/assets/iceCream/myCupChocoStrawberry.png',
    3000,
    35
  ],
  [
    'Cookies n Creamy',
    'Es krim lembut premium berpadu butiran kukis renyah melimpah yang memberikan sensasi tekstur creamy menggoda.',
    'ice cream',
    '/src/assets/iceCream/cookiesnCreamy.png',
    5500,
    30
  ],
  [
    'Fantazee Choco Mix',
    'Es krim rasa cokelat lapis kombinasi rasa unik dengan lelehan cokelat nikmat yang membuat hari makin seru.',
    'ice cream',
    '/src/assets/iceCream/fantazeeChocoMix.png',
    2500,
    40
  ],
  [
    'Fantazee Strawberry',
    'Es krim stik rasa buah stroberi merah segar dengan rasa manis buah alami yang ceria dan menyegarkan suasana.',
    'ice cream',
    '/src/assets/iceCream/fantazeeStrawberry.png',
    2500,
    40
  ],
  [
    'Heart Crunch',
    'Es krim bentuk hati berbalut lapisan cokelat renyah bertabur kacang krispi dengan es krim lembut nikmat di dalamnya.',
    'ice cream',
    '/src/assets/iceCream/heartCrunch.png',
    5500,
    35
  ]
];

async function seedDatabaseDefaults(pool) {
  try {
    // 1. Pastikan kolom deskripsi ada
    const [cols] = await pool.query("SHOW COLUMNS FROM products LIKE 'deskripsi'");
    if (cols.length === 0) {
      await pool.query('ALTER TABLE products ADD COLUMN deskripsi TEXT NULL AFTER nama_produk');
    }

    // 2. Pastikan pengguna default (Admin, Staff, Guest)
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('[SEED] Menyiapkan data awal pengguna (Admin, Staff, Guest)...');
      await pool.query(`
        INSERT INTO users (nama, password, role) VALUES 
        ('admin', 'admin123', 'admin'),
        ('staff', 'staff123', 'staff'),
        ('Guest Customer', 'guest', 'customer')
      `);
    } else {
      const [guestRows] = await pool.query("SELECT id FROM users WHERE role = 'customer' LIMIT 1");
      if (guestRows.length === 0) {
        await pool.query("INSERT INTO users (nama, password, role) VALUES ('Guest Customer', 'guest', 'customer')");
      }
    }

    // 3. Pastikan produk kuliner Ketsai tersedia
    const [prodRows] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (prodRows[0].count === 0) {
      console.log('[SEED] Menyiapkan 29 data menu kuliner otentik Ketsai...');
      for (const item of initialProducts) {
        await pool.query(
          'INSERT INTO products (nama_produk, deskripsi, kategori, gambar, harga, jumlahStok) VALUES (?, ?, ?, ?, ?, ?)',
          item
        );
      }
    }
  } catch (err) {
    console.warn('[WARN] Peringatan saat inisialisasi data seed:', err.message);
  }
}

module.exports = {
  initialProducts,
  seedDatabaseDefaults
};
