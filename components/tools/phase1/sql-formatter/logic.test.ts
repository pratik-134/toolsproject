import { formatSql, minifySql } from "./logic";

export function runTests(): boolean {
  // Test 1: Basic SELECT statement formatting
  const rawSql = "select id, name, email from users where active = 1 and age > 18 order by name asc;";
  const formatted = formatSql(rawSql, { indentSize: 2, uppercaseKeywords: true });

  if (!formatted.includes("SELECT") || !formatted.includes("FROM users") || !formatted.includes("WHERE")) {
    throw new Error(`Test 1 SELECT formatting failed:\n${formatted}`);
  }

  // Test 2: Two-word keywords (ORDER BY, LEFT JOIN)
  const joinSql = "select u.id from users u left join orders o on u.id = o.user_id group by u.id;";
  const joinFormatted = formatSql(joinSql, { indentSize: 2, uppercaseKeywords: true });
  if (!joinFormatted.includes("LEFT JOIN") || !joinFormatted.includes("GROUP BY")) {
    throw new Error(`Test 2 JOIN failed:\n${joinFormatted}`);
  }

  // Test 3: Minify SQL
  const minified = minifySql("SELECT  id,  name \n FROM users  WHERE  id = 1; -- comment");
  if (minified !== "SELECT id,name FROM users WHERE id=1;") {
    throw new Error(`Test 3 minify failed: ${minified}`);
  }

  return true;
}
