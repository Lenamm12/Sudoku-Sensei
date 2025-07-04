// src/ai/flows/ai-hint.ts
'use server';
/**
 * @fileOverview A Sudoku hint AI agent.
 *
 * - getSudokuHint - A function that provides a hint for the next logical move in a Sudoku puzzle.
 * - GetSudokuHintInput - The input type for the getSudokuHint function.
 * - GetSudokuHintOutput - The return type for the getSudokuHint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetSudokuHintInputSchema = z.object({
  grid: z
    .array(z.array(z.number()))
    .describe('A 9x9 Sudoku grid represented as a 2D array of numbers. Use 0 for empty cells.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard', 'expert'])
    .default('medium')
    .describe('The difficulty level of the hint.'),
});
export type GetSudokuHintInput = z.infer<typeof GetSudokuHintInputSchema>;

const GetSudokuHintOutputSchema = z.object({
  row: z.number().describe('The row index of the cell to fill (0-8).'),
  col: z.number().describe('The column index of the cell to fill (0-8).'),
  value: z.number().describe('The value to fill in the cell (1-9).'),
  reasoning: z.string().describe('The reasoning behind the hint.'),
});
export type GetSudokuHintOutput = z.infer<typeof GetSudokuHintOutputSchema>;

export async function getSudokuHint(input: GetSudokuHintInput): Promise<GetSudokuHintOutput> {
  return getSudokuHintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getSudokuHintPrompt',
  input: {schema: GetSudokuHintInputSchema},
  output: {schema: GetSudokuHintOutputSchema},
  prompt: `You are an expert Sudoku solver. Given the current state of a Sudoku grid, your task is to provide a hint for the next logical move.

Sudoku rules: Each row, column, and 3x3 subgrid must contain the numbers 1-9 without repetition.

Current Sudoku Grid:
{{#each grid}}
  {{#each this}}{{{this}}} {{/each}}
{{/each}}

Difficulty Level: {{difficulty}}

Provide a hint by suggesting a single cell to fill with a number, and explain the deduction required to arrive at that solution. Focus on providing hints that align with the specified difficulty level.

Output must follow the JSON schema: {
  "row": number, // The row index of the cell to fill (0-8)
  "col": number, // The column index of the cell to fill (0-8)
  "value": number, // The value to fill in the cell (1-9)
  "reasoning": string // The reasoning behind the hint
}
`,
});

const getSudokuHintFlow = ai.defineFlow(
  {
    name: 'getSudokuHintFlow',
    inputSchema: GetSudokuHintInputSchema,
    outputSchema: GetSudokuHintOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
