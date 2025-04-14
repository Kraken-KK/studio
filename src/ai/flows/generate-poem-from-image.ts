'use server';
/**
 * @fileOverview An AI agent that generates a poem from an image.
 *
 * - generatePoemFromImage - A function that handles the poem generation process.
 * - GeneratePoemFromImageInput - The input type for the generatePoemFromImage function.
 * - GeneratePoemFromImageOutput - The return type for the generatePoemFromImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePoemFromImageInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the image to generate a poem from.'),
});
export type GeneratePoemFromImageInput = z.infer<typeof GeneratePoemFromImageInputSchema>;

const GeneratePoemFromImageOutputSchema = z.object({
  poem: z.string().describe('The poem generated from the image.'),
});
export type GeneratePoemFromImageOutput = z.infer<typeof GeneratePoemFromImageOutputSchema>;

export async function generatePoemFromImage(
  input: GeneratePoemFromImageInput
): Promise<GeneratePoemFromImageOutput> {
  return generatePoemFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePoemFromImagePrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the image to generate a poem from.'),
    }),
  },
  output: {
    schema: z.object({
      poem: z.string().describe('The poem generated from the image.'),
    }),
  },
  prompt: `You are a poet. You are given an image, and you will write a poem based on the image's content, style, and mood.  The poem should be evocative and creative.

Image: {{media url=photoUrl}}`,
});

const generatePoemFromImageFlow = ai.defineFlow<
  typeof GeneratePoemFromImageInputSchema,
  typeof GeneratePoemFromImageOutputSchema
>({
  name: 'generatePoemFromImageFlow',
  inputSchema: GeneratePoemFromImageInputSchema,
  outputSchema: GeneratePoemFromImageOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
