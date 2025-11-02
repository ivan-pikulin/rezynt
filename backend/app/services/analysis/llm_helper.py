import httpx
from openai import AsyncOpenAI
from typing import Optional

from app.core.config import settings


class LLMHelper:
    """Helper class for LLM-based text improvements using OpenAI"""
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.openai.OPENAI_API_KEY,
            http_client=httpx.AsyncClient(proxy=settings.openai.OPENAI_PROXY_URL)
        )
        self.model = "gpt-4o-mini"
        self.temperature = 0.3
    
    async def shorten_text(self, text: str, max_words: int, preserve_meaning: bool = True) -> Optional[str]:
        """Shorten text to specified word count while preserving meaning"""
        try:
            prompt = f"""Shorten this resume bullet point to under {max_words} words while {'preserving the core meaning and impact' if preserve_meaning else 'maintaining clarity'}:

"{text}"

Return only the shortened version, no explanations."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                max_tokens=150
            )
            
            return response.choices[0].message.content.strip().strip('"')
        except Exception as e:
            print(f"Error in shorten_text: {e}")
            return None
    
    async def add_metrics_to_achievement(self, achievement: str, prompt: str = "") -> Optional[str]:
        """Add quantifiable metrics to an achievement"""
        try:
            system_prompt = prompt or (
                "Add specific quantifiable metrics (percentages, dollar amounts, "
                "numbers of users/projects, time saved) to make this achievement "
                "more concrete and impressive. Keep the core message the same."
            )
            
            full_prompt = f"""{system_prompt}

Original: "{achievement}"

Return only the improved version with metrics, no explanations."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": full_prompt}],
                temperature=self.temperature,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip().strip('"')
        except Exception as e:
            print(f"Error in add_metrics_to_achievement: {e}")
            return None
    
    async def convert_to_results(self, text: str) -> Optional[str]:
        """Convert responsibility-focused text to results-oriented achievement"""
        try:
            prompt = f"""Rewrite this resume bullet to focus on results and impact rather than just responsibilities or duties:

"{text}"

Use strong action verbs and emphasize outcomes. Return only the rewritten version, no explanations."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip().strip('"')
        except Exception as e:
            print(f"Error in convert_to_results: {e}")
            return None
    
    async def improve_verb(self, text: str) -> Optional[str]:
        """Replace weak verbs with stronger action verbs"""
        try:
            prompt = f"""Replace weak verbs with strong, impactful action verbs in this resume bullet:

"{text}"

Return only the improved version, no explanations."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip().strip('"')
        except Exception as e:
            print(f"Error in improve_verb: {e}")
            return None
    
    async def remove_passive_voice(self, text: str) -> Optional[str]:
        """Convert passive voice to active voice"""
        try:
            prompt = f"""Convert this resume bullet from passive voice to active voice:

"{text}"

Return only the active voice version, no explanations."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip().strip('"')
        except Exception as e:
            print(f"Error in remove_passive_voice: {e}")
            return None
    
    async def expand_summary(self, summary: str, min_length: int) -> Optional[str]:
        """Expand professional summary to meet minimum length"""
        try:
            prompt = f"""Expand this professional summary to at least {min_length} characters while keeping it focused and impactful:

"{summary}"

Return only the expanded version, no explanations."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip().strip('"')
        except Exception as e:
            print(f"Error in expand_summary: {e}")
            return None
    
    async def condense_summary(self, summary: str, max_length: int) -> Optional[str]:
        """Condense professional summary to maximum length"""
        try:
            prompt = f"""Condense this professional summary to under {max_length} characters while keeping the key points:

"{summary}"

Return only the condensed version, no explanations."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip().strip('"')
        except Exception as e:
            print(f"Error in condense_summary: {e}")
            return None
    
    async def suggest_job_title(self, current_title: str, job_description: str = "") -> Optional[str]:
        """Suggest a more specific, industry-standard job title"""
        try:
            context = f" based on this context: {job_description}" if job_description else ""
            prompt = f"""Suggest a more specific, industry-standard job title to replace this generic title{context}:

"{current_title}"

Return only the suggested title, no explanations."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                max_tokens=50
            )
            
            return response.choices[0].message.content.strip().strip('"')
        except Exception as e:
            print(f"Error in suggest_job_title: {e}")
            return None
    
    async def remove_pronouns(self, text: str) -> Optional[str]:
        """Remove personal pronouns from text"""
        try:
            prompt = f"""Remove personal pronouns (I, me, my, we, our) from this text while maintaining clarity:

"{text}"

Return only the version without pronouns, no explanations."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip().strip('"')
        except Exception as e:
            print(f"Error in remove_pronouns: {e}")
            return None
    
    async def replace_buzzwords(self, text: str, buzzwords: list) -> Optional[str]:
        """Replace buzzwords with concrete, specific terms"""
        try:
            buzzwords_str = ", ".join(buzzwords)
            prompt = f"""Replace these buzzwords ({buzzwords_str}) with concrete, specific terms in this text:

"{text}"

Return only the improved version, no explanations."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip().strip('"')
        except Exception as e:
            print(f"Error in replace_buzzwords: {e}")
            return None
    
    async def remove_filler(self, text: str, fillers: list) -> Optional[str]:
        """Remove filler phrases from text"""
        try:
            fillers_str = ", ".join(fillers)
            prompt = f"""Remove these filler phrases ({fillers_str}) from this text to make it more concise:

"{text}"

Return only the improved version, no explanations."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip().strip('"')
        except Exception as e:
            print(f"Error in remove_filler: {e}")
            return None


# Singleton instance
llm_helper = LLMHelper()

