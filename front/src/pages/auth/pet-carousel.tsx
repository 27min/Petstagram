import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

interface Pet {
    id: string;
    name: string;
    age: number;
    species: string;
    breed: string;
    gender: string;
    photoUrl?: string;
}

interface PetCardProps {
    pet: Pet;
}

const PetCard: React.FC<PetCardProps> = ({ pet }) => (
    <div className="space-y-4">
        <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {pet.photoUrl ? (
                    <img 
                        src={pet.photoUrl} 
                        alt={pet.name} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-gray-400 text-center">
                        <span className="block">No Photo</span>
                    </div>
                )}
            </div>
            <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-500">이름</p>
                        <p className="font-medium">{pet.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">나이</p>
                        <p className="font-medium">{pet.age}세</p>
                    </div>
                    <div>
                        <p className="text-gray-500">종류</p>
                        <p className="font-medium">{pet.species}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">품종</p>
                        <p className="font-medium">{pet.breed}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">성별</p>
                        <p className="font-medium">{pet.gender}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

interface PetCarouselProps {
    pets: Pet[];
}

export const PetCarousel: React.FC<PetCarouselProps> = ({ pets }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextPet = () => {
        setCurrentIndex((prev) => (prev + 1) % pets.length);
    };

    const prevPet = () => {
        setCurrentIndex((prev) => (prev - 1 + pets.length) % pets.length);
    };

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">반려동물 정보</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                        {currentIndex + 1} / {pets.length}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={prevPet}
                            className="p-1 rounded-full hover:bg-gray-100"
                            disabled={pets.length <= 1}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextPet}
                            className="p-1 rounded-full hover:bg-gray-100"
                            disabled={pets.length <= 1}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            <PetCard pet={pets[currentIndex]} />
        </div>
    );
};

