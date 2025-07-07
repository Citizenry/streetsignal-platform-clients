export function isSupportedFieldType(fieldType: string): boolean {
  const supportedTypes = [
    'title',
    'description',
    'varchar',
    'text',
    'textarea',
    'tags',
    'date',
    'datetime',
    'radio',
    'checkbox',
    'select',
    'number',
    'upload',
    'video',
    'location',
    'relation',
    'markdown',
    'multiple_images',
    'video_upload',
  ];

  return supportedTypes.includes(fieldType);
}

export function isMediaFieldType(fieldType: string): boolean {
  return ['upload', 'video', 'multiple_images', 'video_upload'].includes(fieldType);
}

export function getFieldInputType(fieldType: string): string {
  const typeMapping: { [key: string]: string } = {
    multiple_images: 'multiple_images',
    video_upload: 'video_upload',
  };

  return typeMapping[fieldType] || fieldType;
}
