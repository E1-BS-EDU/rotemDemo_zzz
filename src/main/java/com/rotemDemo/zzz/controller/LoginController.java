package com.rotemDemo.zzz.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    private static final Logger log = LoggerFactory.getLogger(LoginController.class);

    @Value("${app.services.wdc}")
    private String wdcUrl;

    @GetMapping("/")
    //@GetMapping("/login")
    public String loginPage(Model model) {
        log.debug("wdcUrl: {}", wdcUrl);
        model.addAttribute("wdcUrl", wdcUrl);

        return "zzz/login/login";
    }

    @GetMapping("/loginOutPage")
    public String loginOutPage(Model model) {
        return "zzz/login/login";
    }

    @GetMapping("/password-change")
    public String passwordChangePage() {
        return "redirect:/login";
    }
}
