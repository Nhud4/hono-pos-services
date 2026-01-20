import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import localConfig from '../libs/config.js';

export async function uploadImage(imageBuffer: Buffer): Promise<string> {
  try {
    const fileName = `${uuidv4()}.webp`;

    const supabase = createClient(localConfig.supabaseUrl, localConfig.supabaseAnonKey);

    const { data, error } = await supabase.storage
      .from('dev_resto')
      .upload(fileName, imageBuffer, {
        contentType: 'image/webp',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('dev_resto')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}