/**
 * Tokenize a math expression into numbers and operators.
 */
const tokenize = (expression: string): (number | string)[] => {
  const tokens: (number | string)[] = [];
  let i = 0;

  while (i < expression.length) {
    const char = expression[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Parse number (including decimals and negative numbers at start or after operator)
    if (
      /\d/.test(char) ||
      (char === "." && /\d/.test(expression[i + 1] ?? "")) ||
      (char === "-" &&
        (tokens.length === 0 || typeof tokens[tokens.length - 1] === "string"))
    ) {
      let numStr = "";
      if (char === "-") {
        numStr = "-";
        i++;
      }
      while (i < expression.length && /[\d.]/.test(expression[i])) {
        numStr += expression[i];
        i++;
      }
      const num = parseFloat(numStr);
      if (isNaN(num)) {
        return [];
      }
      tokens.push(num);
      continue;
    }

    // Parse operator
    if (/[+\-*/]/.test(char)) {
      tokens.push(char);
      i++;
      continue;
    }

    // Invalid character
    return [];
  }

  return tokens;
};

/**
 * Evaluate a tokenized expression respecting operator precedence.
 * Uses a simple two-pass approach: first * and /, then + and -.
 */
const evaluateTokens = (tokens: (number | string)[]): number | undefined => {
  if (tokens.length === 0) {
    return undefined;
  }

  // First pass: handle * and /
  const intermediate: (number | string)[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token === "*" || token === "/") {
      const left = intermediate.pop();
      const right = tokens[i + 1];

      if (typeof left !== "number" || typeof right !== "number") {
        return undefined;
      }

      if (token === "/" && right === 0) {
        return undefined; // Division by zero
      }

      intermediate.push(token === "*" ? left * right : left / right);
      i += 2;
    } else {
      intermediate.push(token);
      i++;
    }
  }

  // Second pass: handle + and -
  let result = intermediate[0];
  if (typeof result !== "number") {
    return undefined;
  }

  i = 1;
  while (i < intermediate.length) {
    const operator = intermediate[i];
    const right = intermediate[i + 1];

    if (typeof right !== "number") {
      return undefined;
    }

    if (operator === "+") {
      result += right;
    } else if (operator === "-") {
      result -= right;
    } else {
      return undefined;
    }

    i += 2;
  }

  return result;
};

/**
 * Safely evaluate a simple math expression without using eval().
 * Supports: +, -, *, / operators and decimal numbers.
 */
export const evaluateMath = (expression: string): number | undefined => {
  // Validate that expression only contains allowed characters
  if (/^[\d\s.+*/-]+$/.test(expression) === false) {
    return undefined;
  }

  try {
    const tokens = tokenize(expression);
    return evaluateTokens(tokens);
  } catch {
    return undefined;
  }
};
