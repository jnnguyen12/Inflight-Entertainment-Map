import requests
import os
from datetime import datetime, timedelta

def download_files(start_time, end_time, base_url):
    start = datetime.strptime(start_time, "%H%M%S")
    end = datetime.strptime(end_time, "%H%M%S")
    
    current = start
    while current <= end:
        file_time = current.strftime("%H%M%S") + "Z"
        file_name = file_time + ".json.gz"
        file_url = base_url + file_name

        response = requests.get(file_url)
        if response.status_code == 200:
            with open(file_name, "wb") as file:
                file.write(response.content)
            print(f"Downloaded {file_name}")
        else:
            print(f"Failed to download {file_name}")

        current += timedelta(seconds=5)

if __name__ == "__main__":
    base_url = "https://samples.adsbexchange.com/readsb-hist/2023/01/01/"
    start_time = "000000"
    end_time = "010000"
    download_files(start_time, end_time, base_url)
