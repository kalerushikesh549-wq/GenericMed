package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

// Medicine represents a pharmaceutical molecule and its generic equivalent
type Medicine struct {
	ID                  string  `json:"id"`
	BrandName           string  `json:"brandName"`
	BrandManufacturer   string  `json:"brandManufacturer"`
	BrandPrice          float64 `json:"brandPrice"`
	GenericName         string  `json:"genericName"`
	GenericManufacturer string  `json:"genericManufacturer"`
	GenericPrice        float64 `json:"genericPrice"`
	SavingsPercentage   float64 `json:"savingsPercentage"`
	Form                string  `json:"form"`
	ActiveSalt          string  `json:"activeSalt"`
	BioEquivalenceScore float64 `json:"bioEquivalenceScore"`
	FDARating           string  `json:"fdaRating"`
	NDC                 string  `json:"ndc"`
	InStock             bool    `json:"inStock"`
	Dosage              string  `json:"dosage"`
}

type SubstitutionResponse struct {
	OriginalMedicine Medicine `json:"originalMedicine"`
	GenericMatch     Medicine `json:"genericMatch"`
	SavingsAmount    float64  `json:"savingsAmount"`
	SavingsPercent   float64  `json:"savingsPercent"`
	IsBioEquivalent  bool     `json:"isBioEquivalent"`
	EquivalenceCode  string   `json:"equivalenceCode"`
	Timestamp        string   `json:"timestamp"`
}

type OrangeBookEntry struct {
	ApplNo               string `json:"applNo"`
	ProductNo            string `json:"productNo"`
	Ingredient           string `json:"ingredient"`
	DosageFormRoute      string `json:"dosageFormRoute"`
	TradeName            string `json:"tradeName"`
	Applicant            string `json:"applicant"`
	Strength             string `json:"strength"`
	TECode               string `json:"teCode"`
	RLD                  bool   `json:"rld"`
	RS                   bool   `json:"rs"`
	Type                 string `json:"type"`
	ApprovalDate         string `json:"approvalDate"`
	PatentNo             string `json:"patentNo,omitempty"`
	PatentExpireDate     string `json:"patentExpireDate,omitempty"`
	ExclusivityCode      string `json:"exclusivityCode,omitempty"`
	ExclusivityExpireDate string `json:"exclusivityExpireDate,omitempty"`
}

var (
	catalogStore    []Medicine
	orangeBookStore []OrangeBookEntry
	storeMutex      sync.RWMutex
)


func init() {
	// Canonical initial catalog items (aligned with mockData.ts)
	catalogStore = []Medicine{
		{
			ID:                  "med-1",
			BrandName:           "Lipitor 20mg",
			BrandManufacturer:   "Pfizer Labs",
			BrandPrice:          98.50,
			GenericName:         "Atorvastatin Calcium 20mg",
			GenericManufacturer: "Cipla / Teva Multi-Source",
			GenericPrice:        14.20,
			SavingsPercentage:   85.6,
			Form:                "30 Tablets (Oral) • Film-coated",
			ActiveSalt:          "Atorvastatin Calcium Trihydrate (20mg equivalent)",
			BioEquivalenceScore: 99.4,
			FDARating:           "AB Rated",
			NDC:                 "0071-0156-23",
			InStock:             true,
			Dosage:              "1 tablet orally once daily at bedtime (qHS)",
		},
		{
			ID:                  "med-2",
			BrandName:           "Augmentin 625mg",
			BrandManufacturer:   "GSK Pharmaceuticals",
			BrandPrice:          42.00,
			GenericName:         "Amoxicillin + Pot. Clavulanate 625mg",
			GenericManufacturer: "Aurobindo / Sandoz",
			GenericPrice:        8.50,
			SavingsPercentage:   79.8,
			Form:                "10 Tablets • Oral",
			ActiveSalt:          "Amoxicillin Trihydrate + Potassium Clavulanate",
			BioEquivalenceScore: 99.1,
			FDARating:           "A-Rated",
			NDC:                 "43598-445-14",
			InStock:             true,
			Dosage:              "1 tablet twice daily with meals for 7 days",
		},
		{
			ID:                  "med-3",
			BrandName:           "Glucophage XR 500mg",
			BrandManufacturer:   "Bristol Myers Squibb",
			BrandPrice:          48.00,
			GenericName:         "Metformin HCl Extended-Release 500mg",
			GenericManufacturer: "Zydus / Teva",
			GenericPrice:        6.00,
			SavingsPercentage:   87.5,
			Form:                "100 Tablets ER • Oral",
			ActiveSalt:          "Metformin Hydrochloride (Extended Release)",
			BioEquivalenceScore: 99.6,
			FDARating:           "AB Rated",
			NDC:                 "50268-301-10",
			InStock:             true,
			Dosage:              "1 tablet once daily with dinner",
		},
		{
			ID:                  "med-4",
			BrandName:           "Crestor 10mg",
			BrandManufacturer:   "AstraZeneca",
			BrandPrice:          110.00,
			GenericName:         "Rosuvastatin Calcium 10mg",
			GenericManufacturer: "Glenmark / Watson",
			GenericPrice:        16.00,
			SavingsPercentage:   85.4,
			Form:                "30 Tablets • Oral",
			ActiveSalt:          "Rosuvastatin Calcium",
			BioEquivalenceScore: 99.2,
			FDARating:           "AB Rated",
			NDC:                 "65862-594-30",
			InStock:             true,
			Dosage:              "1 tablet once daily",
		},
		{
			ID:                  "med-5",
			BrandName:           "Prilosec 20mg",
			BrandManufacturer:   "Procter & Gamble",
			BrandPrice:          34.50,
			GenericName:         "Omeprazole Delayed-Release 20mg",
			GenericManufacturer: "Dr. Reddy's Laboratories",
			GenericPrice:        7.20,
			SavingsPercentage:   79.1,
			Form:                "30 Capsules • Oral",
			ActiveSalt:          "Omeprazole Magnesium",
			BioEquivalenceScore: 99.0,
			FDARating:           "AB Rated",
			NDC:                 "55111-123-30",
			InStock:             true,
			Dosage:              "1 capsule 30 minutes before breakfast",
		},
	}
}

// enableCORS sets cross-origin headers for frontend client communication
func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tenant-ID")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":      "UP",
		"service":     "genericmed-catalog-service",
		"engine":      "Go 1.22",
		"totalItems":  len(catalogStore),
		"time":        time.Now().UTC().Format(time.RFC3339),
	})
}

func listMedicinesHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	query := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))

	storeMutex.RLock()
	defer storeMutex.RUnlock()

	var results []Medicine
	for _, med := range catalogStore {
		if query == "" ||
			strings.Contains(strings.ToLower(med.BrandName), query) ||
			strings.Contains(strings.ToLower(med.GenericName), query) ||
			strings.Contains(strings.ToLower(med.ActiveSalt), query) ||
			strings.Contains(strings.ToLower(med.NDC), query) {
			results = append(results, med)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func getMedicineHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(pathParts) < 4 {
		http.Error(w, `{"error":"Invalid request URL"}`, http.StatusBadRequest)
		return
	}
	id := pathParts[3]

	storeMutex.RLock()
	defer storeMutex.RUnlock()

	for _, med := range catalogStore {
		if med.ID == id || med.NDC == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(med)
			return
		}
	}

	http.Error(w, `{"error":"Medicine not found in catalog"}`, http.StatusNotFound)
}

func substitutesHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(pathParts) < 4 {
		http.Error(w, `{"error":"Invalid request URL"}`, http.StatusBadRequest)
		return
	}
	id := pathParts[3]

	storeMutex.RLock()
	defer storeMutex.RUnlock()

	for _, med := range catalogStore {
		if med.ID == id || med.NDC == id {
			savingsAmount := math.Round((med.BrandPrice-med.GenericPrice)*100) / 100
			savingsPct := math.Round(((med.BrandPrice-med.GenericPrice)/med.BrandPrice)*1000) / 10

			resp := SubstitutionResponse{
				OriginalMedicine: med,
				GenericMatch:     med,
				SavingsAmount:    savingsAmount,
				SavingsPercent:   savingsPct,
				IsBioEquivalent:  med.BioEquivalenceScore >= 98.0,
				EquivalenceCode:  med.FDARating,
				Timestamp:        time.Now().UTC().Format(time.RFC3339),
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(resp)
			return
		}
	}

	http.Error(w, `{"error":"No bio-equivalent substitutes found"}`, http.StatusNotFound)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8001"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/api/v1/catalog/medicines", listMedicinesHandler)
	mux.HandleFunc("/api/v1/catalog/medicines/", getMedicineHandler)
	mux.HandleFunc("/api/v1/catalog/substitutes/", substitutesHandler)

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	fmt.Printf("[Catalog Service] Go Microservice listening on port %s...\n", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}
