"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import PetSupport from '@/app/components/PetSupport';
import Link from 'next/link';

interface Pet {
  id: string;
  name: string;
  breed: string;
  description: string;
  funFacts: string[];
  image?: string;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Create a default pet to use only if no pets exist in localStorage
const defaultPet: Pet = {
  id: generateId(),
  name: "Test Pet",
  breed: "Test Breed",
  description: "This is a test pet to verify the edit functionality",
  funFacts: ["Loves to play", "Enjoys treats"],
  image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop"
};

export default function Pets() {
  const { logout, isAuthenticated } = useAuth();
  const [pets, setPets] = useState<Pet[]>(() => {
    try {
      // Try to get existing pets from localStorage
      if (typeof window !== 'undefined') {
        const savedPets = localStorage.getItem('pets');
        if (savedPets) {
          const parsedPets = JSON.parse(savedPets);
          // If we have valid pets in localStorage, use them
          if (Array.isArray(parsedPets) && parsedPets.length > 0) {
            return parsedPets;
          }
        }
        // If no pets in localStorage, use the default pet
        const initialPets = [defaultPet];
        localStorage.setItem('pets', JSON.stringify(initialPets));
        return initialPets;
      }
      return [defaultPet];
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return [defaultPet];
    }
  });

  // Save pets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('pets', JSON.stringify(pets));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [pets]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [newPet, setNewPet] = useState<Pet>({
    id: '',
    name: '',
    breed: '',
    description: '',
    funFacts: [''],
    image: '',
  });
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState<string>('');
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleCropComplete = () => {
    const croppedImageUrl = getCroppedImg();
    if (croppedImageUrl) {
      setPreviewImage(croppedImageUrl);
      setIsCropping(false);
    }
  };

  const handleAddFact = () => {
    setNewPet({
      ...newPet,
      funFacts: [...newPet.funFacts, ''],
    });
  };

  const handleFactChange = (index: number, value: string) => {
    const updatedFacts = [...newPet.funFacts];
    updatedFacts[index] = value;
    setNewPet({
      ...newPet,
      funFacts: updatedFacts,
    });
  };

  const handleRemoveFact = (index: number) => {
    setNewPet({
      ...newPet,
      funFacts: newPet.funFacts.filter((_, i) => i !== index),
    });
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setNewPet({
      ...pet,
      image: pet.image || '' // Ensure image is properly set
    });
    setPreviewImage(pet.image || '');
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDuplicate = (pet: Pet) => {
    const duplicatedPet = {
      ...pet,
      id: generateId(),
      name: `${pet.name} (Copy)`,
    };
    setPets(prevPets => [...prevPets, duplicatedPet]);
  };

  const handleDelete = (petId: string) => {
    if (confirm('Are you sure you want to delete this pet?')) {
      setPets(pets.filter(p => p.id !== petId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Start with the current image
      let finalImage = isEditMode && editingPet ? editingPet.image : '';

      // If there's a new file selected, upload it
      if (fileInputRef.current?.files?.length) {
        const formData = new FormData();
        formData.append('file', fileInputRef.current.files[0]);

        try {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image');
          }

          const { imageUrl } = await uploadResponse.json();
          finalImage = imageUrl;
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
          return;
        }
      } else if (previewImage) {
        // If we have a preview image (data URL), use that
        finalImage = previewImage;
      }

      // Create the updated pet object
      const updatedPet = {
        ...newPet,
        id: isEditMode && editingPet ? editingPet.id : generateId(),
        image: finalImage
      };

      // Update the pets state
      if (isEditMode && editingPet) {
        setPets(prevPets => prevPets.map(p => 
          p.id === editingPet.id ? updatedPet : p
        ));
      } else {
        setPets(prevPets => [...prevPets, updatedPet]);
      }
      
      // Reset form
      setNewPet({
        id: '',
        name: '',
        breed: '',
        description: '',
        funFacts: [''],
        image: '',
      });
      setPreviewImage('');
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingPet(null);
    } catch (error) {
      console.error('Error adding/editing pet:', error);
      alert('Failed to add/edit pet. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#454f61]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">My Pets</h1>
          {isAuthenticated && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#7d8fb0] hover:bg-[#6b7a96] text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Add New Pet
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pets.map((pet, index) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative">
                {pet.image ? (
                  <div className="relative w-full h-64">
                    {pet.image.startsWith('data:') ? (
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={pet.image}
                        alt={pet.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    )}
                    {isAuthenticated && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEdit(pet);
                          }}
                          className="bg-[#7d8fb0] text-white hover:bg-[#6b7a96] p-2 rounded-full transition-colors duration-200"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDuplicate(pet);
                          }}
                          className="bg-[#7d8fb0] text-white hover:bg-[#6b7a96] p-2 rounded-full transition-colors duration-200"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(pet.id);
                          }}
                          className="bg-[#7d8fb0] text-white hover:bg-[#6b7a96] p-2 rounded-full transition-colors duration-200"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500">No image</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{pet.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{pet.breed}</p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{pet.description}</p>
                <div className="space-y-2">
                  {pet.funFacts.map((fact, index) => (
                    <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      • {fact}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Bambi Gallery Link */}
        <div className="flex justify-center mt-12">
          <Link
            href="/gallery?category=bambi"
            className="bg-[#7d8fb0] hover:bg-[#6b7a96] text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <span>View Bambi Gallery</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Add the PetSupport component here */}
        <div className="mt-16">
          <PetSupport />
        </div>

        {/* Only render modal if authenticated */}
        {isAuthenticated && (
          <AnimatePresence>
            {isModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {isEditMode ? 'Edit Pet' : 'Add New Pet'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pet Photo
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {isCropping ? (
                            <div className="relative w-full max-w-md mx-auto">
                              <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                aspect={1}
                              >
                                <img
                                  ref={imageRef}
                                  src={tempImage}
                                  alt="Crop me"
                                  className="max-w-full h-auto"
                                />
                              </ReactCrop>
                              <div className="mt-4 flex justify-center gap-4">
                                <button
                                  type="button"
                                  onClick={handleCropComplete}
                                  className="bg-[#7d8fb0] text-white px-4 py-2 rounded-md hover:bg-[#6b7a96]"
                                >
                                  Crop Image
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsCropping(false);
                                    setTempImage('');
                                  }}
                                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : previewImage ? (
                            <div className="relative w-full h-48 mb-4">
                              <img
                                src={previewImage}
                                alt="Preview"
                                className="w-full h-full object-contain rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewImage('');
                                  setTempImage('');
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <>
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                  <span>Upload a file</span>
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="sr-only"
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pet Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newPet.name}
                        onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Breed
                      </label>
                      <input
                        type="text"
                        required
                        value={newPet.breed}
                        onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        required
                        value={newPet.description}
                        onChange={(e) => setNewPet({ ...newPet, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fun Facts
                      </label>
                      {newPet.funFacts.map((fact, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            required
                            value={fact}
                            onChange={(e) => handleFactChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                          />
                          {newPet.funFacts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFact(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddFact}
                        className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        + Add Another Fact
                      </button>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setPreviewImage('');
                          setNewPet({
                            id: '',
                            name: '',
                            breed: '',
                            description: '',
                            funFacts: [''],
                            image: '',
                          });
                          setIsEditMode(false);
                          setEditingPet(null);
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-700 dark:text-gray-300"
                        disabled={isUploading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 bg-[#7d8fb0] text-white rounded-md hover:bg-[#6b7a96] flex items-center ${
                          isUploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          isEditMode ? 'Save Changes' : 'Add Pet'
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
} 