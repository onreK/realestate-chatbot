export async function POST(request) {
  try {
    const { messages } = await request.json();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are Amanda\'s helpful real estate assistant for the Richmond & Chester Virginia area. Keep responses friendly, helpful, and focused on real estate. Always encourage users to book a consultation. Be knowledgeable about home buying, selling, and the local market.' 
          },
          ...messages.map(msg => ({
            role: msg.from === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Sorry, I had trouble processing that. Please try again.';
    
    return Response.json({ message: reply });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Response.json({ 
      message: 'Thanks for your message! Amanda will get back to you soon. Please feel free to schedule a consultation above.' 
    }, { status: 500 });
  }
}
