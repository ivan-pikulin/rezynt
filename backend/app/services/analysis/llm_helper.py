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


class BatchFixItem(BaseModel):
    """Single item in batch fix request"""
    index: int  # Original index for mapping back
    text: str  # Text to process


class BatchFixResponse(BaseModel):
    """Response for batch fix processing"""
    fixes: List[FixResponse]  # List of fixes matching input order


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

    async def call_llm_batch(
        self,
        task_description: str,
        items: List[str],
        max_tokens: int = 2000,
        temperature: Optional[float] = None
    ) -> List[FixResponse]:
        """
        Batch process multiple texts in a single LLM call.

        More efficient than multiple individual calls when processing similar items.
        Processes all items together and returns fixes in the same order.

        Args:
            task_description: Description of what to do with each item
            items: List of texts to process
            max_tokens: Maximum tokens in response (default: 2000 for batch)
            temperature: Override default temperature (default: 0.3)

        Returns:
            List of FixResponse objects, one per input item in same order.
            If error occurs, returns list of error FixResponse objects.

        Example usage:
            achievements = ["Led project", "Helped team", "Worked on feature"]
            fixes = await llm_helper.call_llm_batch(
                "Add specific metrics to each achievement",
                achievements
            )
        """
        if not items:
            return []

        try:
            # Build batch prompt with numbered items
            items_text = "\n".join([f"{i+1}. {text}" for i, text in enumerate(items)])

            prompt = f"""{task_description}

Process each item below and provide fixes in the same order:

{items_text}

For each item, provide:
- has_fix: true if you can improve it, false otherwise
- fixed_text: the improved version (if has_fix is true)
- reasoning: explanation if no fix is possible

Return a JSON array of fixes matching the input order."""

            response = await self.client.beta.chat.completions.parse(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature or self.temperature,
                max_tokens=max_tokens,
                response_format=BatchFixResponse
            )

            batch_response = response.choices[0].message.parsed

            # Ensure we have the same number of responses as inputs
            if len(batch_response.fixes) != len(items):
                print(f"Warning: Batch response count mismatch. Expected {len(items)}, got {len(batch_response.fixes)}")
                # Pad with error responses if needed
                while len(batch_response.fixes) < len(items):
                    batch_response.fixes.append(FixResponse(has_fix=False, reasoning="No response from LLM"))

            return batch_response.fixes[:len(items)]

        except Exception as e:
            print(f"Error in call_llm_batch: {e}")
            # Return error response for each item
            return [FixResponse(has_fix=False, reasoning=f"Batch error: {str(e)}") for _ in items]
    


# Singleton instance
llm_helper = LLMHelper()
