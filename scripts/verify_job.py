import requests
from dotenv import load_dotenv
from requests_html import HTMLSession
import os

session = HTMLSession()

load_dotenv()

def verify_url_href(url: str, href: str) -> bool:
    try:
      r = session.get(url)
      r.html.render(sleep=1)
      return href in r.html.absolute_links
    except requests.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return False

if __name__ == "__main__":
  params = {
    "depth": 0,
    "where[verified][equals]": False,
  }

  authorization_header = f"{os.getenv('PAYLOAD_SLUG_THIRD_PARTY_ACCESS')} API-Key {os.getenv('PAYLOAD_API_KEY')}"

  response = requests.get(
    "http://localhost:3000/api/declarations",
    headers={
      "Authorization": authorization_header,
      "Content-Type": "application/json",
    },
    params=params,
  )

  if response.status_code != 200:
    print("Failed to fetch data from the API.")

  data = response.json().get('docs', [])

  for declaration in data:
    url = f"{declaration.get('url')}"
    href = f"{declaration.get('url')}/mentions"

    print(f"Verifying declaration {declaration.get('id')} with URL: {url} and href: {href}")

    if not url or not href:
      print(f"Declaration {declaration.get('id')} is missing URL or href.")
      continue

    is_verified = verify_url_href(url, href)

    print(f"Declaration {declaration.get('id')} verification result: {is_verified}")

    update_response = requests.patch(
      f"http://localhost:3000/api/declarations/{declaration.get('id')}",
      headers={
        "Authorization": authorization_header,
        "Content-Type": "application/json",
      },
      json={"verified": is_verified},
    )

    if update_response.status_code == 200:
      print(f"Successfully updated declaration {declaration.get('id')} verification status to {is_verified}.")
    else:
      print(f"Failed to update declaration {declaration.get('id')} verification status.")