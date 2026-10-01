/**
 * Genera el hash bcrypt de una password para usar como APP_PASSWORD_HASH en .env.
 *
 * Uso:
 *   npm run hash-password -- "miPasswordSegura"
 *
 * El resultado se imprime por stdout; copiarlo tal cual (con las comillas)
 * como valor de APP_PASSWORD_HASH en server/.env.
 */
import * as bcrypt from 'bcrypt';

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error('Uso: npm run hash-password -- "miPasswordSegura"');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

void main();
