import httpx
from openai import AsyncOpenAI
from typing import List, Optional
from pydantic import BaseModel

from app.core.config import settings


class FixResponse(BaseModel):
    """
    Structured response from LLM for fix generation.
    
    This is the ONLY response format used by call_llm_structured().
    All LLM prompts should describe the task, and OpenAI will format the response.
    
    For complex responses (lists, nested data), use JSON serialization in fixed_text
    and parse it in the rule.
    """
    has_fix: bool  # True if fix can be generated
    fixed_text: Optional[str] = None  # Fixed content OR JSON string for complex data
    reasoning: Optional[str] = None  # Why no fix available (error message or explanation)


class LLMHelper:
    """
    Helper class for LLM-based text improvements using OpenAI.
    
    Uses OpenAI Structured Outputs for guaranteed response format.
    All rules should use call_llm_structured() - the single universal method.
    """
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.openai.OPENAI_API_KEY,
            http_client=httpx.AsyncClient(proxy=settings.openai.OPENAI_PROXY_URL)
        )
        self.model = "gpt-4o-mini"
        self.temperature = 0.3
    
    async def call_llm_structured(
        self,
        prompt: str,
        max_tokens: int = 300,
        temperature: Optional[float] = None
    ) -> FixResponse:
        """
        Universal method for calling LLM with Structured Outputs.
        
        Uses OpenAI's Structured Outputs feature to guarantee response format.
        All improvement point generators should use this method to get fixes.
        
        Args:
            prompt: Complete prompt to send to LLM. Describe the task clearly.
                   OpenAI will automatically format response as FixResponse.
            max_tokens: Maximum tokens in response (default: 300)
            temperature: Override default temperature (default: 0.3)
            
        Returns:
            FixResponse with has_fix, fixed_text, and optional reasoning.
            Response is guaranteed to match FixResponse schema.
            
        Example prompt:
            '''
            Improve this text by adding metrics.
            
            Original: "{text}"
            
            If you can add metrics, set has_fix to true and provide fixed_text.
            If not possible, set has_fix to false and explain in reasoning.
            '''
        """
        try:
            response = await self.client.beta.chat.completions.parse(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature or self.temperature,
                max_tokens=max_tokens,
                response_format=FixResponse
            )
            
            # With Structured Outputs, the response is already parsed
            return response.choices[0].message.parsed
            
        except Exception as e:
            print(f"Error in call_llm_structured: {e}")
            return FixResponse(has_fix=False, reasoning=f"Error: {str(e)}")
    


# Singleton instance
llm_helper = LLMHelper()
