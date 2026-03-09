import { query } from './backend/src/config/sqlite-database.js';

const getTemplateDetails = async () => {
  try {
    console.log('📄 TEMPLATE MESSAGES - FULL DETAILS:');
    console.log('=====================================');
    
    const templates = await query('SELECT * FROM templates ORDER BY id');
    
    if (templates.rows.length === 0) {
      console.log('❌ No templates found in the database');
    } else {
      templates.rows.forEach((template, index) => {
        console.log(`\n📧 TEMPLATE ${index + 1}:`);
        console.log(`   ID: ${template.id}`);
        console.log(`   User ID: ${template.user_id}`);
        console.log(`   Name: ${template.name}`);
        console.log(`   Subject: ${template.subject}`);
        console.log(`   Type: ${template.type}`);
        console.log(`   Is Default: ${template.is_default ? 'YES' : 'NO'}`);
        console.log(`   Created: ${template.created_at}`);
        console.log(`   Updated: ${template.updated_at}`);
        console.log('\n   📝 FULL MESSAGE BODY:');
        console.log('   ' + '='.repeat(50));
        console.log(`   ${template.body}`);
        console.log('   ' + '='.repeat(50));
      });
    }
    
  } catch (error) {
    console.error('❌ Error getting template details:', error.message);
  } finally {
    process.exit(0);
  }
};

getTemplateDetails();
