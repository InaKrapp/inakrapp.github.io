library(here)
webshot2::webshot(here("presentations/LLM_assistants/Ina Krapp – Coding Assistants in RStudio and Visual Studio Code.html"),
                  file = here("presentations/LLM_assistants/thumbnail.png"),
                  vwidth = 1280, vheight = 720)

webshot2::webshot(here("presentations/Statistik/Ina Krapp - Statistik in der Geographie.html#/wie-häufig-ist-die-normalverteilung-1"),
                  file = here("presentations/Statistik/thumbnail.png"),
                  vwidth = 1280, vheight = 720, 
delay = 5)

library(chromote)

# Start a Chrome session
chrome <- chromote::chrome_new()

# Navigate to the page
chrome$navigate(here("presentations/Statistik/Ina Krapp - Statistik in der Geographie.html"))

# Wait for the page to load and Reveal.js to initialize
Sys.sleep(2)

# Execute JavaScript to go to slide 5 (index 4)
chrome$evaluate("Reveal.slide(4)")

# Wait for the transition
Sys.sleep(1)

# Take screenshot
screenshot_path <- here("presentations/Statistik/thumbnail.png")
chrome$screenshot(path = screenshot_path, width = 1280, height = 720)

# Clean up
chrome$close()