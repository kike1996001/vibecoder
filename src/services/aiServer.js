// Server-side AI helper: tries Gemini (Google) if key+SDK present, otherwise fallback heuristics
export async function inlineEdit({ selectedText = '', instruction = '', fileContent = '', filePath = '' }) {
  let modified = selectedText ?? '';

  // Try Google Generative AI (Gemini) if key and SDK available
  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  let GoogleGenerativeAI = null;
  if (geminiKey) {
    try {
      GoogleGenerativeAI = (await import('@google/generative-ai')).GoogleGenerativeAI;
    } catch (err) {
      GoogleGenerativeAI = null;
    }
  }

  if (geminiKey && GoogleGenerativeAI) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-pro-preview-05-06',
        generationConfig: { temperature: 0.15, maxOutputTokens: 8192 },
      });

      const systemPrompt = `You are a helpful code editor assistant. The user will provide a selected code fragment and an instruction. Return ONLY the modified code fragment, with no surrounding commentary or markdown.`;

      const chat = model.startChat({
        history: [
          { role: 'system', parts: [{ text: systemPrompt }] },
          {
            role: 'user',
            parts: [
              {
                text: `File: ${filePath}\nInstruction: ${instruction}\nSelected code:\n\n${selectedText}`,
              },
            ],
          },
        ],
      });

      const streamResult = await chat.sendMessageStream(`${instruction}`);
      let full = '';
      for await (const chunk of streamResult.stream) {
        full += chunk.text();
      }

      modified = full.replace(/```(json|ts|tsx|js|jsx)?\s*/g, '').replace(/```\s*$/g, '').trim();
      return { modified };
    } catch (err) {
      console.error('aiServer.inlineEdit: Gemini failed, falling back:', err?.message || err);
    }
  }

  // Fallback heuristics
  if (instruction) {
    const inst = instruction.toLowerCase();
    if (inst.includes('uppercase')) modified = modified.toUpperCase();
    else if (inst.includes('lowercase')) modified = modified.toLowerCase();
    else if (inst.includes('wrap in try') || inst.includes('try/catch')) {
      modified = `try {\n${modified}\n} catch (e) {\n  console.error(e);\n}`;
    }
  }

  return { modified };
}
