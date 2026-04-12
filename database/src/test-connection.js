import { testConnection, closePool } from './db.js';

async function main() {
    console.log('🔍 Testing database connection...\n');
    
    const success = await testConnection();
    
    if (success) {
        console.log('\n✅ All systems ready!');
        console.log('📝 Next step: Run "npm run setup" to create tables');
    } else {
        console.log('\n❌ Connection failed!');
        console.log('📝 Check your .env file configuration');
    }
    
    await closePool();
    process.exit(success ? 0 : 1);
}

main().catch(console.error);
