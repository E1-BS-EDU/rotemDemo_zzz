package com.rotemDemo.zzz.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @GetMapping("/main")
    public String main() {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "zzz/login/login";
    }
}
