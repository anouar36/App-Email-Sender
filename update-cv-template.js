import { query } from './backend/src/config/sqlite-database.js';

const updateTemplate = async () => {
  try {
    const templateId = 2; // Your template ID
    
    const updatedBody = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Candidature - Anouar Ech-charai</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: 'Inter', Arial, sans-serif;
      color: #333333;
      line-height: 1.6;
    }
    .container {
      max-width: 650px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      margin-bottom: 30px;
    }
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      font-weight: 700;
      /* TITRE EN ORANGE PROFESSIONNEL */
      color: #e65100;
      margin: 0 0 10px 0;
    }
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      /* NOM EN NOIR */
      color: #000000;
      margin: 0 0 20px 0;
    }
    .location {
      font-size: 14px;
      color: #888888;
    }
    hr {
      border: none;
      border-top: 1px solid #e0e0e0;
      margin: 30px 0;
    }
    p {
      font-size: 15px;
      margin-bottom: 15px;
    }
    .contact {
      margin-top: 40px;
      font-size: 14px;
    }
    .contact a {
      color: #1a1a1a;
      text-decoration: none;
      margin-right: 15px;
      display: inline-block;
      margin-bottom: 5px;
    }
    .contact a:hover {
      text-decoration: underline;
    }
    .highlight {
        font-weight: 600;
    }
    .cv-section {
      background-color: #f8f9fa;
      border-left: 4px solid #e65100;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 0 5px 5px 0;
    }
    .cv-links {
      margin-top: 10px;
    }
    .cv-links a {
      display: inline-block;
      margin: 5px 10px 5px 0;
      padding: 8px 15px;
      background-color: #e65100;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      font-size: 13px;
    }
    .cv-links a:hover {
      background-color: #d84315;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Anouar Ech-charai</h1>
      <div class="title">Développeur Full Stack Java / Angular</div>
      <div class="location">📍 Maroc</div>
    </div>
    <hr>
    <p>Bonjour,</p>
    <p>
      Je vous contacte pour vous présenter ma candidature au poste de <strong>Développeur Full Stack Java/Angular</strong>.
    </p>
    <p>
      Actuellement en fin de formation à <strong>YouCode (UM6P)</strong>, j'ai développé une expertise solide sur l'écosystème <strong>Spring Boot</strong> et <strong>Angular</strong>. Au travers de projets concrets comme <em>HandyOps</em> ou <em>LogiTrack</em>, j'ai pu mettre en œuvre des architectures complètes intégrant la sécurité (Keycloak), la conteneurisation (Docker) et les pipelines CI/CD.
    </p>
    <p>
      Mon stage de 2 mois en entreprise a également confirmé ma capacité à m'adapter rapidement aux exigences professionnelles et à travailler efficacement au sein d'une équipe agile.
    </p>
    <p>
        Passionné et opérationnel, je serais ravi de vous détailler mon parcours de vive voix.
    </p>
    
    <div class="cv-section">
      <p class="highlight" style="margin-bottom: 5px;">
        📋 <strong>Mon CV et réalisations sont disponibles en ligne :</strong>
      </p>
      <div class="cv-links">
        <a href="https://anouar-echcharai.vercel.app/" target="_blank">🌐 Portfolio Complet</a>
        <a href="https://www.linkedin.com/in/anouar-ech-charai/" target="_blank">💼 Profil LinkedIn</a>
      </div>
      <p style="font-size: 13px; color: #666; margin-top: 10px; margin-bottom: 0;">
        <em>Vous y trouverez mes projets, compétences techniques et expériences détaillées.</em>
      </p>
    </div>
    
    <p>Cordialement,<br>Anouar Ech-charai</p>
    <hr>
    <div class="contact">
      <a href="mailto:anouarechcharai@gmail.com">📧 anouarechcharai@gmail.com</a>
      <a href="tel:+212639383709">📱 +212 639383709</a><br>
      <a href="https://anouar-echcharai.vercel.app/" target="_blank">🌐 Mon Portfolio</a>
      <a href="https://www.linkedin.com/in/anouar-ech-charai/" target="_blank">💼 LinkedIn</a>
    </div>
  </div>
</body>
</html>`;

    console.log('🔄 Updating template with improved CV section...');
    
    const result = await query(
      'UPDATE templates SET body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [updatedBody, templateId]
    );
    
    if (result.rowCount > 0) {
      console.log('✅ Template updated successfully!');
      console.log('\n📋 Changes made:');
      console.log('- Removed reference to "CV ci-joint"');
      console.log('- Added professional CV section with links');
      console.log('- Improved styling with highlighted portfolio links');
      console.log('- Made it clear that CV is available online');
    } else {
      console.log('❌ Failed to update template');
    }
    
  } catch (error) {
    console.error('❌ Error updating template:', error.message);
  } finally {
    process.exit(0);
  }
};

updateTemplate();
