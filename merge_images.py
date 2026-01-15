from PIL import Image
import sys
import os

def merge_images(image_paths, output_path):
    images = []
    for path in image_paths:
        if not os.path.exists(path):
            print(f"Error: File not found at {path}")
            return
        try:
            img = Image.open(path)
            images.append(img)
        except Exception as e:
            print(f"Error opening {path}: {e}")
            return

    if not images:
        print("No images to merge.")
        return

    # Target height based on the first image (or a fixed suitable height for Twitter)
    # Twitter single image ideal ratio is often 16:9, but for side-by-side, we just want them to align.
    # Let's align to the minimum height to avoid upscaling artifacts, or maximum?
    # Usually matching the first image's height or a standard height (e.g., 1080px) is good.
    # Let's pick the height of the tallest image to keep resolution, or smallest to avoid upscaling?
    # Let's use the first image's height as reference, or better, the max height to preserve detail.
    target_height = min(img.height for img in images) 

    resized_images = []
    total_width = 0
    
    print(f"Resizing images to height: {target_height}px")

    for img in images:
        aspect_ratio = img.width / img.height
        new_width = int(target_height * aspect_ratio)
        resized_img = img.resize((new_width, target_height), Image.Resampling.LANCZOS)
        resized_images.append(resized_img)
        total_width += new_width

    # Create new blank image
    new_image = Image.new('RGB', (total_width, target_height))

    # Paste images
    current_x = 0
    for img in resized_images:
        new_image.paste(img, (current_x, 0))
        current_x += img.width

    # Save
    try:
        new_image.save(output_path, quality=95)
        print(f"Successfully saved merged image to: {output_path}")
    except Exception as e:
        print(f"Error saving image: {e}")

if __name__ == "__main__":
    image_paths = [
        '/Users/sdw/Downloads/IMG_2649.jpeg',
        '/Users/sdw/Desktop/IMG_2652.jpeg',
        '/Users/sdw/Desktop/Corruption.jpg'
    ]
    output_path = 'twitter_merged_image.jpg'
    
    # Check if Pillow is installed
    try:
        import PIL
    except ImportError:
        print("Pillow library is not installed. Please install it using: pip install Pillow")
        sys.exit(1)

    merge_images(image_paths, output_path)
