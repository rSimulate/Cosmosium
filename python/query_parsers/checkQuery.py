
def checkQuery(req):
    # checks to ensure the query has the required parameters, else returns false
    if req.query.gameID\
    and req.query.player:
        return True
    else :
        print '\n ERR: required params not found in '+str(req.query)+'\n'
        return False
        