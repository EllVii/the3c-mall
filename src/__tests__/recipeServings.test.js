import { scaledAmount, validServings, displayAmount } from "../utils/recipeServings";
describe("recipe serving arithmetic", () => {
  test("doubles an ingredient from 2 to 4 servings", () => expect(scaledAmount(1.5, 2, 4)).toBe(3));
  test("halves from 4 to 2 servings", () => expect(scaledAmount(2, 4, 2)).toBe(1));
  test("preserves fractions without integer rounding", () => expect(scaledAmount(.5, 4, 3)).toBe(.375));
  test("rejects invalid serving counts", () => expect(validServings(0, 4)).toBe(4));
  test("caps requested yield at 24", () => expect(validServings(25, 4)).toBe(4));
  test("displays small quantities clearly", () => expect(displayAmount(1.5)).toBe("1.5"));
});
