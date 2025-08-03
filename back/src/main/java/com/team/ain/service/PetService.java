package com.team.ain.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.team.ain.dto.Pet;
import com.team.ain.dto.PetRegist;
import com.team.ain.mapper.MemberMapper;
import com.team.ain.mapper.PetMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PetService {

    private final PetMapper petMapper;
    private final MemberMapper memberMapper;

    // 생성
    public void addPet(PetRegist pet) {
        petMapper.insertPet(pet);
    }

    // ID로 조회
    public Pet getPetById(Long id) {
        return petMapper.selectPetById(id);
    }

    public List<Pet> getPetByMeberId(Long memberId) {
        return petMapper.selectPetByMemberId(memberId);
    }

    // 전체 조회
    public List<Pet> getAllPets() {
        return petMapper.selectAllPets();
    }

    // 수정
    public void updatePet(Pet pet) {
        petMapper.updatePet(pet);
    }

    // 삭제
    public void deletePet(Long id) {
        petMapper.deletePet(id);
    }

    // 멤버 이메일로 반려동물 찾기
    public List<Pet> findByEmail(String email) {
        Long id = memberMapper.findByEmail(email).get().getId();
        return petMapper.findAllByMemberId(id);
    }
    

    


    // 현재 멤버의 펫 등록 20241212
    public void registerMyPet(String email, PetRegist petRegist) {
        // 이메일로 멤버 ID 찾기
        Long memberId = memberMapper.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("해당 이메일의 회원을 찾을 수 없습니다."))
            .getId();

        // 이미 펫이 등록되어 있는지 확인 1214에 이거 일단 삭제함
        // Pet existingPet = petMapper.findByMemberId(memberId);
        // if (existingPet != null) {
        //     throw new RuntimeException("이미 반려동물이 등록되어 있습니다.");
        // }

        // memberId 설정
        petRegist.setMemberId(memberId);

        // 펫 등록
        petMapper.insertPet(petRegist);
    }

    // 1214 현재 멤버의 모든 반려동물 가져오기
    public List<Pet> getPetsByMemberEmail(String email) {
        // 이메일로 멤버 ID 찾기
        Long memberId = memberMapper.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("해당 이메일의 회원을 찾을 수 없습니다."))
            .getId();

        // 멤버 ID로 모든 반려동물 가져오기
        return petMapper.findAllByMemberId(memberId);
    }

    // 특정 반려동물 수정
    public void updateMyPet(String email, Pet petUpdateInfo) {
        // 이메일로 멤버 ID 찾기
        Long memberId = memberMapper.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("해당 이메일의 회원을 찾을 수 없습니다."))
            .getId();

        // 수정하려는 반려동물 가져오기
        Pet existingPet = petMapper.selectPetById(petUpdateInfo.getId());
        if (existingPet == null || !existingPet.getMemberId().equals(memberId)) {
            throw new RuntimeException("수정하려는 반려동물이 없거나 권한이 없습니다.");
        }

        // 기존 펫 정보 업데이트
        existingPet.setName(petUpdateInfo.getName());
        existingPet.setSpecies(petUpdateInfo.getSpecies());
        existingPet.setBreed(petUpdateInfo.getBreed());
        existingPet.setGender(petUpdateInfo.getGender());
        existingPet.setAge(petUpdateInfo.getAge());
        existingPet.setPhotoUrl(petUpdateInfo.getPhotoUrl());

        // 펫 정보 업데이트
        petMapper.updatePet(existingPet);
    }

    // 특정 반려동물 삭제
    public void deleteMyPet(String email, Long petId) {
        // 이메일로 멤버 ID 찾기
        Long memberId = memberMapper.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("해당 이메일의 회원을 찾을 수 없습니다."))
            .getId();

        // 삭제하려는 반려동물 가져오기
        Pet existingPet = petMapper.selectPetById(petId);
        if (existingPet == null || !existingPet.getMemberId().equals(memberId)) {
            throw new RuntimeException("삭제하려는 반려동물이 없거나 권한이 없습니다.");
        }

        // 펫 삭제
        petMapper.deletePet(petId);
    }
}
