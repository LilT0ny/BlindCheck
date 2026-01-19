from PIL import Image, ExifTags

# Función para corregir orientación EXIF
def correct_image_orientation(img: Image.Image) -> Image.Image:
    """Corrige la orientación de la imagen según metadatos EXIF"""
    try:
        # Obtener información EXIF
        exif = img._getexif()
        if exif is None:
            return img
        
        # Buscar el tag de orientación
        orientation_key = None
        for tag, value in ExifTags.TAGS.items():
            if value == 'Orientation':
                orientation_key = tag
                break
        
        if orientation_key is None:
            return img
            
        orientation = exif.get(orientation_key)
        
        # Aplicar rotación según orientación EXIF
        if orientation == 3:
            img = img.rotate(180, expand=True)
        elif orientation == 6:
            img = img.rotate(270, expand=True)
        elif orientation == 8:
            img = img.rotate(90, expand=True)
            
        # print(f"   📐 Orientación EXIF corregida: {orientation}")
        
    except (AttributeError, KeyError, IndexError, TypeError):
        # Si no hay EXIF o hay error, devolver imagen original
        pass
    return img
