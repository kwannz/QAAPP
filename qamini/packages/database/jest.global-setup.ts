// Global setup for database tests
export default async () => {
  console.log('Setting up database test environment...');
  
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_qa_db?schema=public';
  
  // You can add database setup logic here if needed
  // For example, running migrations, seeding test data, etc.
};