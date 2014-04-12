import csv
import json

def csv2json(csvFile, headers=True):
    # converts csv in fname csv to json @ json fname
    # if headers==True, read them from file, else assume header is list of header strings.
    csvfile = open(csvFile, 'r')
    jsonfile = open(csvFile.split('.')[0]+'.json', 'w')

    if headers!=True:
        fieldnames = headers
        reader = csv.DictReader( csvfile, fieldnames)
    else:
        reader = csv.DictReader( csvfile )
    for row in reader:
        json.dump(row, jsonfile)
        jsonfile.write('\n')