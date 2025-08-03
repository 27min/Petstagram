package com.team.ain.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("api")
public class MainController {

    @GetMapping("/main")
    public String getMethodName(@RequestParam String param) {
        return "main Controller";
    }
    
    
}
